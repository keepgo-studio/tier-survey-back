import { getFirestore } from "firebase-admin/firestore";
import { toCamelCase } from "../utils";
import LeagueOfLegendsStore from "./league-of-legends";

export function generateCollectionUrl(game: SupportGame, collectionType: FS_SupportCollectionType) {
  return `${toCamelCase(game)}-${collectionType}`;
}

export default class Store {
  private db;

  constructor() {
    this.db = getFirestore();
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

  async getSurvey(game: SupportGame, hashedId: string) {
    const surveyRef = this.db
      .collection(generateCollectionUrl(game, "survey"))
      .doc(hashedId);

    const doc = await surveyRef.get();

    if (doc.exists) {
      return doc.data() as FS_Survey;
    }

    return undefined;
  }

  async getUser(game: SupportGame, hashedId: string) {
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.getUser(this.db, hashedId);
    }

    return undefined;
  }

  async resetChartAndPlayerTable(game: SupportGame, hashedId: string) {
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.resetChartAndPlayerTable(this.db, hashedId);
    }

    return false;
  }

  async initStat(game: SupportGame, hashedId: string) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.initStat(this.db, hashedId);
    }
  }

  async setStat<T extends SupportGame>(game: T, hashedId: string, data: StatParamMap<T>) {
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.setStat(this.db, hashedId, data);
    }
  }

  async writeToLeagueOfLegendsChart<T extends LeaugeOfLegendsApiType>(
    hostHashedId: string,
    apiType: T,
    param: LeagueOfLegendsApiParamMap<T>
  ) {
    try {
      await LeagueOfLegendsStore.writeToChart(this.db, hostHashedId, apiType, param);
      return true;
    } catch {
      return false;
    }
  }
}