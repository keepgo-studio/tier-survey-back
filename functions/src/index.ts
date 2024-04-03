import Store from './db/store';
import * as game1 from './games/league-of-legends';
import { initializeApp } from "firebase-admin/app";

initializeApp();

export const leagueOfLegends = {
  ...game1
};

export const auth = {
  // "naver": "oauth2-callback"
  // "rso":
}

export const store = new Store();