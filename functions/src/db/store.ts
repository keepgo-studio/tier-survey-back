import { getFirestore } from "firebase-admin/firestore";
import { toCamelCase } from "../utils";
import LeagueOfLegendsStore, {
  type FS_LeagueOfLegendsUser,
  type FS_LeagueOfLegendsStat,
  FS_LeagueOfLegendsPlayerTableItem,
} from "./league-of-legends";

export type UserParam = {
  "league of legends": Partial<FS_LeagueOfLegendsUser>;
  "teamfight tactics": {};
  valorant: {};
};

export type StatParam = {
  "league of legends": Partial<FS_LeagueOfLegendsStat>;
  "teamfight tactics": {};
  valorant: {};
};

type StatReturn = {
  "league of legends": FS_LeagueOfLegendsStat;
  "teamfight tactics": {};
  valorant: {};
};

export type ChartParam = {
  "league of legends": FS_LeagueOfLegendsStat;
  "teamfight tactics": {};
  valorant: {};
};

export type PlayerTableParam = {
  "league of legends": FS_LeagueOfLegendsPlayerTableItem;
  "teamfight tactics": {};
  valorant: {};
};

type PlayerTableReturn = {
  "league of legends": { solo: FS_LeagueOfLegendsPlayerTableItem[], flex: FS_LeagueOfLegendsPlayerTableItem[] };
  "teamfight tactics": {};
  valorant: {};
}

type FS_SupportGameCollectionType =
  | "users"
  | "survey"
  | "stat"
  | "chart"
  | "chart-ready"
  | "player-table";

export function generateCollectionUrl(
  game: SupportGame,
  collectionType: FS_SupportGameCollectionType
) {
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

    await surveyRef.set(data);
  }

  async writeSurvey(game: SupportGame, hashedId: string, data: Partial<FS_Survey>) {
    const surveyRef = this.db
      .collection(generateCollectionUrl(game, "survey"))
      .doc(hashedId);

    await surveyRef.update(data);
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

  async writeUser<T extends SupportGame>(
    game: T,
    hashedId: string,
    data: UserParam[T]
  ) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.writeUser(this.db, hashedId, data);
    }
  }

  async getUser(game: SupportGame, hashedId: string) {
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.getUser(this.db, hashedId);
    }

    return undefined;
  }

  async resetChartAndPlayerTable(game: SupportGame, hashedId: string) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.resetChartAndPlayerTable(this.db, hashedId);
    }
  }

  async initStat(game: SupportGame, hashedId: string) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.initStat(this.db, hashedId);
    }
  }

  async checkStatExist(game: SupportGame, hashedId: string) {
    const surveyRef = this.db
      .collection(generateCollectionUrl(game, "survey"))
      .doc(hashedId);

    const doc = await surveyRef.get();

    return doc.exists;
  }

  async setStat<T extends SupportGame>(
    game: T,
    hashedId: string,
    data: StatParam[T]
  ) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.setStat(this.db, hashedId, data);
    }
  }

  async getStat<T extends SupportGame>(
    game: T,
    hashedId: string
  ): Promise<StatReturn[T] | undefined> {
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.getStat(this.db, hashedId);
    }

    return undefined;
  }

  async setPlayerTable<T extends SupportGame>(
    game: T,
    hostHashedId: string,
    hashedId: string,
    param: PlayerTableParam[T]
  ) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.writeToPlayerTable(
        this.db,
        hostHashedId,
        hashedId,
        param as PlayerTableParam["league of legends"]
      );
    }
  }

  async getTop100PlayerTable<T extends SupportGame>(game: T, hashedId: string): Promise<PlayerTableReturn[T] | undefined> {
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.getTop100PlayerTable(this.db, hashedId);
    }

    return undefined;
  }

  async checkPlayerTable(
    game: SupportGame,
    hostHashedId: string,
    hashedId: string
  ) {
    const playerTableRef = this.db
      .collection(generateCollectionUrl(game, "player-table"))
      .doc(hostHashedId);

    const playerTable = await playerTableRef.get();

    if (!playerTable.exists) {
      return false;
    }

    if (hashedId in playerTable.data()!) {
      return true;
    }

    return false;
  }

  async setChart<T extends SupportGame>(
    game: T,
    hostHashedId: string,
    param: ChartParam[T]
  ) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.setChartWithStat(
        this.db,
        hostHashedId,
        param as ChartParam["league of legends"]
      );
    }
  }

  async getChart(game: SupportGame, hostHashedId: string) {
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.getChart(this.db, hostHashedId);
    }

    return undefined;
  }

  async getMyRanking(game: SupportGame, hostHashedId: string, hashedId: string) { 
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.getMyRanking(this.db, hostHashedId, hashedId);
    }

    return undefined;
  }
}
