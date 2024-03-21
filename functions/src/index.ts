import * as game1 from './games/league-of-legends';
import { initializeApp } from "firebase-admin/app";

initializeApp();

export const leagueOfLegends = {
  ...game1
};