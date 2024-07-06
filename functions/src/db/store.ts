import { getFirestore } from "firebase-admin/firestore";
import { toCamelCase } from "../utils";
import LeagueOfLegendsStore, {
  type FS_LeagueOfLegendsUser,
  type FS_LeagueOfLegendsStat,
} from "./league-of-legends";

export type UserParam = {
  "league of legends": Partial<FS_LeagueOfLegendsUser>;
  "teamfight tactics": {};
  valorant: {};
};

type UserParamMap<T extends SupportGame> = UserParam[T];

export type StatParam = {
  "league of legends": Partial<FS_LeagueOfLegendsStat>;
  "teamfight tactics": {};
  valorant: {};
};

type StatParamMap<T extends SupportGame> = StatParam[T];

type StatReturn = {
  "league of legends": FS_LeagueOfLegendsStat;
  "teamfight tactics": {};
  valorant: {};
};

type StatReturnMap<T extends SupportGame> = StatReturn[T];

export type ChartParam = {
  "league of legends": FS_LeagueOfLegendsStat;
  "teamfight tactics": {};
  valorant: {};
};

type ChartParamMap<T extends SupportGame> = ChartParam[T];

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
    data: UserParamMap<T>
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
    data: StatParamMap<T>
  ) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.setStat(this.db, hashedId, data);
    }
  }

  async getStat<T extends SupportGame>(
    game: T,
    hashedId: string
  ): Promise<StatReturnMap<T> | undefined> {
    if (game === "league of legends") {
      return await LeagueOfLegendsStore.getStat(this.db, hashedId);
    }

    return undefined;
  }

  async setPlayerTable(
    game: SupportGame,
    hostHashedId: string,
    hashedId: string,
    tierNumeric: number
  ) {
    if (game === "league of legends") {
      await LeagueOfLegendsStore.writeToPlayerTable(
        this.db,
        hostHashedId,
        hashedId,
        tierNumeric
      );
    }
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
    param: ChartParamMap<T>
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
}
