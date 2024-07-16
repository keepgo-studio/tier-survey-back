import Store from './db/store';
import * as game1 from './endpoints/league-of-legends';
import { initializeApp } from "firebase-admin/app";

initializeApp();

export const leagueOfLegends = {
  ...game1
};

export const store = new Store();