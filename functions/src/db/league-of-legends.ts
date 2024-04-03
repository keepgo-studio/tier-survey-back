import { Firestore } from "firebase-admin/firestore";
import { generateCollectionUrl } from "./store";

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
          },
          totalLevel: 0,
          mostLovedChampion: {},
          updateDate: new Date(),
        };

    const platyerTableData: FS_LeagueOfLegendsPlayerTable = { players: {} };

    try {
      await chartRef.set(chartData);
      await playerTableRef.set(platyerTableData);
      return true;
    } catch {
      return false;
    }
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
    
    return await db.runTransaction(async (t) => {
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

  static async writeToChart<T extends LeaugeOfLegendsApiType>(
    db: Firestore,
    hostHashedId: string,
    apiType: T,
    param: LeagueOfLegendsApiParamMap<T>,
  ) {
    const chartRef = db
      .collection(generateCollectionUrl("league of legends", "chart"))
      .doc(hostHashedId);

    return await db.runTransaction(async (t) => {
      const doc = await t.get(chartRef),
            chart = doc.data() as FS_LeagueOfLegendsChart;

      if (apiType === "SUMMONER-V4") {
        const { userLevel } = param as LeagueOfLegendsApiParam["SUMMONER-V4"];

        t.update(chartRef, {
          totalLevel: chart.totalLevel + userLevel,
        });
      } else if (apiType === "LEAGUE-V4") {
        const { tier } = param as LeagueOfLegendsApiParam["LEAGUE-V4"];

        chart.tierCnt[tier] = chart.tierCnt[tier] + 1;

        t.update(chartRef, {
          tierCnt: { ...chart.tierCnt },
        });
      } else if (apiType === "CHAMPION-MASTERY-V4") {
        const { champions } = param as LeagueOfLegendsApiParam["CHAMPION-MASTERY-V4"];

        champions.forEach((champ) => {
          if (!(champ.championId in chart.mostLovedChampion)) {
            chart.mostLovedChampion[champ.championId] = 0;
          }

          chart.mostLovedChampion[champ.championId] += 1;
        });

        t.update(chartRef, {
          mostLovedChampion: { ...chart.mostLovedChampion },
        });
      }
    });
  }
}