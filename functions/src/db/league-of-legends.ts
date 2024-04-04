import { Firestore } from "firebase-admin/firestore";
import { generateCollectionUrl } from "./store";
import { getLeagueOfLegendsTier } from "../utils";

export default class LeagueOfLegendsStore {
  static async getUser(db: Firestore, hashedId: string) {
    const surveyRef = db
      .collection(generateCollectionUrl("league of legends", "users"))
      .doc(hashedId);

    const doc = await surveyRef.get();

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
            UNRANK: 0
          },
          totalLevel: 0,
          mostLovedChampion: {},
          updateDate: new Date(),
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

    await db.runTransaction(async t => {
      const doc = await t.get(statRef);

      if (!doc.exists) {
        t.set(statRef, {
          champions: [],
          geo: null,
          level: 0,
          surveyList: {},
          tierNumeric: 0,
          updateDate: new Date(),
        } as FS_LeagueOfLegendsStat);
      }
    });
  }

  static async setStat(db: Firestore, hashedId: string, param: StatParam["league of legends"]) {
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
      stat.champions.forEach(champ => {
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
        updateDate: new Date()
      } as FS_LeagueOfLegendsChart);
    });
  }

  static async writeToPlayerTable (
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
        [hashedId]: tierNumeric
      });
    });
  }
}