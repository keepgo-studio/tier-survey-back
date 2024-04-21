import { Firestore, Timestamp } from "firebase-admin/firestore";
import {
  type ChartParam,
  type StatParam,
  type UserParam,
  generateCollectionUrl,
} from "./store";
import { getLeagueOfLegendsTier } from "../utils";

// firestore collections - league of legends related
/**
 * ## users
 * - collection: leagueOfLegends-users
 * - id: {@link RSOHashedId}
 * - desc: RSO 후 가장 먼저 등록되는 데이터
 *  받아온 id 를 hashed하여 이를 collection의 primary key로 사용하였다.
 */
export type FS_LeagueOfLegendsUser = {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
  hashedId: RSOHashedPUUId;
};

/**
 * ## league of legends stat
 * - collection: leagueOfLegends-stat
 * - id: {@link RSOHashedId}
 * - desc: 유저가 권한을 승인함으로써 내놓은 정보들
 *  여기에 모두 저장완료하면 chart, player-table(티어 기준으로)에 저장
 *  네이버 로그인 여부와 상관없이 RSO후 저장해야함
 */
export type FS_LeagueOfLegendsStat = {
  tierNumeric: LeagueOfLegendsChampionTierNumeric;
  level: number;
  champions: LeagueOfLegendsChampion[];
  surveyList: Record<RSOHashedPUUId, Timestamp>; // 참여한 설문 리스트들
  updateDate: Timestamp;
  geo: { latitude: number; longitude: number } | null;
};

/**
 * ## league of legends chart
 * - collection: leagueOfLegends-chart
 * - id: {@link RSOHashedId}
 * - desc: **종합한 정보들**을 기록한 데이터
 *  transaction read를 사용하여 항상 최신값을 받아오게
 */
export type FS_LeagueOfLegendsChart = {
  participantCnt: number;
  tierCnt: Record<LeagueOfLegendsTier | "UNRANK", number>;
  totalLevel: number;
  mostLovedChampion: Record<LeagueOfLegendsChampionId, number>;
  updateDate: Timestamp;
};

/**
 * ## league of legends player table
 * - collection: leagueOfLegends-player-table
 * - id: {@link RSOHashedId}
 * - desc: 티어순으로 저장하는 유저 테이블, row는 {@link FS_LeagueOfLegendsStat}.
 *  최대 100명까지 저장
 *  firestore에 있는 함수, query의 orderBy, startAt, in연산자를 이용해 조회
 */
export type FS_LeagueOfLegendsPlayerTable = Record<
  RSOHashedPUUId,
  LeagueOfLegendsChampionTierNumeric
>;

export default class LeagueOfLegendsStore {
  static async writeUser(
    db: Firestore,
    hashedId: string,
    data: UserParam["league of legends"]
  ) {
    const userRef = db
      .collection(generateCollectionUrl("league of legends", "users"))
      .doc(hashedId);

    const doc = await userRef.get();

    if (doc.exists) {
      await userRef.update(data);
    } else {
      const initData: FS_LeagueOfLegendsUser = {
        id: "",
        accountId: "",
        puuid: "",
        name: "",
        profileIconId: 0,
        revisionDate: 0,
        summonerLevel: 0,
        hashedId,
        ...data,
      };

      await userRef.set(initData);
    }
  }

  static async getUser(db: Firestore, hashedId: string) {
    const userRef = db
      .collection(generateCollectionUrl("league of legends", "users"))
      .doc(hashedId);

    const doc = await userRef.get();

    if (doc.exists) {
      return doc.data() as FS_LeagueOfLegendsUser;
    }

    return undefined;
  }

  static async resetChartAndPlayerTable(db: Firestore, hashedId: string) {
    const chartRef = db
      .collection(generateCollectionUrl("league of legends", "chart"))
      .doc(hashedId);

    const playerTableRef = db
      .collection(generateCollectionUrl("league of legends", "player-table"))
      .doc(hashedId);

    const chartData: FS_LeagueOfLegendsChart = {
      tierCnt: {
        CHALLENGER: 0,
        GRANDMASTER: 0,
        MASTER: 0,
        DIAMOND: 0,
        EMERALD: 0,
        PLATINUM: 0,
        GOLD: 0,
        SILVER: 0,
        BRONZE: 0,
        IRON: 0,
        UNRANK: 0,
      },
      totalLevel: 0,
      mostLovedChampion: {},
      updateDate: Timestamp.fromDate(new Date()),
      participantCnt: 0,
    };

    const platyerTableData: FS_LeagueOfLegendsPlayerTable = {};

    await chartRef.set(chartData);
    await playerTableRef.set(platyerTableData);
  }

  static async initStat(db: Firestore, hashedId: string) {
    const statRef = db
      .collection(generateCollectionUrl("league of legends", "stat"))
      .doc(hashedId);

    await db.runTransaction(async (t) => {
      const doc = await t.get(statRef);

      if (!doc.exists) {
        t.set(statRef, {
          champions: [],
          geo: null,
          level: 0,
          surveyList: {},
          tierNumeric: 0,
          updateDate: Timestamp.fromDate(new Date()),
        } as FS_LeagueOfLegendsStat);
      }
    });
  }

  static async setStat(
    db: Firestore,
    hashedId: string,
    param: StatParam["league of legends"]
  ) {
    const statRef = db
      .collection(generateCollectionUrl("league of legends", "stat"))
      .doc(hashedId);

    await db.runTransaction(async (t) => {
      if (param.surveyList) {
        const doc = await t.get(statRef),
          stat = doc.data() as FS_LeagueOfLegendsStat,
          newSurveyList = {};

        Object.assign(newSurveyList, stat.surveyList, param.surveyList);

        param.surveyList = { ...newSurveyList };
      }

      t.update(statRef, param);
    });
  }

  static async getStat(db: Firestore, hashedId: string) {
    const statRef = db
      .collection(generateCollectionUrl("league of legends", "stat"))
      .doc(hashedId);

    const doc = await statRef.get();

    if (doc.exists) {
      return doc.data() as FS_LeagueOfLegendsStat;
    }

    return undefined;
  }

  static async setChartWithStat(
    db: Firestore,
    hostHashedId: string,
    stat: ChartParam["league of legends"]
  ) {
    const chartRef = db
      .collection(generateCollectionUrl("league of legends", "chart"))
      .doc(hostHashedId);

    await db.runTransaction(async (t) => {
      const doc = await t.get(chartRef),
        chart = doc.data() as FS_LeagueOfLegendsChart;

      chart.tierCnt[getLeagueOfLegendsTier(stat.tierNumeric)] += 1;
      stat.champions.forEach((champ) => {
        if (!chart.mostLovedChampion[champ.championId]) {
          chart.mostLovedChampion[champ.championId] = 0;
        }

        chart.mostLovedChampion[champ.championId] += 1;
      });

      t.update(chartRef, {
        mostLovedChampion: { ...chart.mostLovedChampion },
        participantCnt: chart.participantCnt + 1,
        tierCnt: { ...chart.tierCnt },
        totalLevel: chart.totalLevel + stat.level,
        updateDate: Timestamp.fromDate(new Date()),
      } as FS_LeagueOfLegendsChart);
    });
  }

  static async writeToPlayerTable(
    db: Firestore,
    hostHashedId: string,
    hashedId: string,
    tierNumeric: number
  ) {
    const playerTableRef = db
      .collection(generateCollectionUrl("league of legends", "player-table"))
      .doc(hostHashedId);

    await db.runTransaction(async (t) => {
      t.update(playerTableRef, {
        [hashedId]: tierNumeric,
      });
    });
  }

  static async getChart(db: Firestore, hashedId: string) {
    const chartRef = db
      .collection(generateCollectionUrl("league of legends", "chart"))
      .doc(hashedId);

    const doc = await chartRef.get();

    if (doc.exists) {
      return doc.data() as FS_LeagueOfLegendsChart;
    }

    return undefined;
  }
}
