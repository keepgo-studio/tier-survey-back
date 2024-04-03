import { getFirestore } from "firebase-admin/firestore";
import { generateCollectionUrl } from "../utils";

import type { ChartDataMap, ChartDataMapParam } from "../games/types";

export class Store {
  private db;

  constructor() {
    this.db = getFirestore();
  }

  async getUser(game: SupportGame, hashedId: string) {
    if (game === "league of legends") {
      const surveyRef = this.db
        .collection(generateCollectionUrl(game, "users"))
        .doc(hashedId);

      const doc = await surveyRef.get();

      if (doc.exists) {
        return doc.data() as FS_LeagueOfLegendsUser;
      }

      return undefined;
    }

    return undefined;
  }

  async setSurvey(game: SupportGame, hashedId: string, data: FS_Survey) {
    const surveyRef = this.db
      .collection(generateCollectionUrl(game, "survey"))
      .doc(hashedId);

    try {
      await surveyRef.set(data);
      return true;
    } catch {
      return false;
    }
  }

  async getSurvey(
    game: SupportGame,
    hashedId: string
  ): Promise<FS_Survey | undefined> {
    const surveyRef = this.db
      .collection(generateCollectionUrl(game, "survey"))
      .doc(hashedId);

    const doc = await surveyRef.get();

    if (doc.exists) {
      return doc.data() as FS_Survey;
    }

    return undefined;
  }

  async resetChartAndPlayerTable(game: SupportGame, hashedId: string) {
    const chartRef = this.db
      .collection(generateCollectionUrl(game, "chart"))
      .doc(hashedId);

    const playerTableRef = this.db
      .collection(generateCollectionUrl(game, "player-table"))
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
      },
      platyerTableData: FS_LeagueOfLegendsPlayerTable = { players: {} };

    try {
      await chartRef.set(chartData);
      await playerTableRef.set(platyerTableData);
      return true;
    } catch {
      return false;
    }
  }

  async initStat(
    game: SupportGame,
    hashedId: string
  ) {
    const statRef = this.db
      .collection(generateCollectionUrl(game, "stat"))
      .doc(hashedId);

    await this.db.runTransaction(async t => {
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

  async setLeagueOfLegendsStat(
    hashedId: string,
    data: Partial<FS_LeagueOfLegendsStat>
  ) {
    const statRef = this.db
      .collection(generateCollectionUrl("league of legends", "stat"))
      .doc(hashedId);

    return await this.db.runTransaction(async (t) => {
      if (data.surveyList) {
        const doc = await t.get(statRef),
              stat = doc.data() as FS_LeagueOfLegendsStat,
              newSurveyList = {};

        Object.assign(newSurveyList, stat.surveyList, data.surveyList);

        data.surveyList = { ...newSurveyList };
      }

      t.update(statRef, data);
    });
  }

  async writeToLeagueOfLegendsChart<T extends LeaugeOfLegendsApiType>(
    hostHashedId: string,
    apiType: T,
    userDataMap: ChartDataMapParam<T>
  ) {
    const chartRef = this.db
      .collection(generateCollectionUrl("league of legends", "chart"))
      .doc(hostHashedId);

    return await this.db.runTransaction(async (t) => {
      const doc = await t.get(chartRef),
            chart = doc.data() as FS_LeagueOfLegendsChart;

      if (apiType === "SUMMONER-V4") {
        const { userLevel } = userDataMap as ChartDataMap["SUMMONER-V4"];

        t.update(chartRef, {
          totalLevel: chart.totalLevel + userLevel,
        });
      } else if (apiType === "LEAGUE-V4") {
        const { tier } = userDataMap as ChartDataMap["LEAGUE-V4"];

        chart.tierCnt[tier] = chart.tierCnt[tier] + 1;

        t.update(chartRef, {
          tierCnt: { ...chart.tierCnt },
        });
      } else if (apiType === "CHAMPION-MASTERY-V4") {
        const { champions } = userDataMap as ChartDataMap["CHAMPION-MASTERY-V4"];

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

  async writeToLeagueOfLegendsPlayerTable(
    hostHashedId: string,
    hashedId: string
  ) {
    
  }
}
