import { getFirestore } from "firebase-admin/firestore";
import { toCamelCase } from "../utils";

export class Store {
  private db;

  constructor() {
    this.db = getFirestore();
  }

  // static getUser(game: SupportGame, hashedId: string) {
  //   switch(game) {
  //     case "league of legends":

  //   }
  // }

  async setSurvey(hashedId: string, param: FS_Survey) {
    const surveyRef = this.db
      .collection(`${toCamelCase(param.game)}-survey`)
      .doc(hashedId);

    try {
      await surveyRef.set(param);
      return true;
    } catch {
      return false;
    }
  }

  async getSurvey(
    hashedId: string,
    game: SupportGame
  ): Promise<FS_Survey | undefined> {
    const surveyRef = this.db
      .collection(`${toCamelCase(game)}-survey`)
      .doc(hashedId as string);

    const doc = await surveyRef.get();

    if (doc.exists) {
      return doc.data() as FS_Survey;
    }

    return undefined;
  }
}
