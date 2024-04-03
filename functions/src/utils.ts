import { https } from "firebase-functions/v1";
import * as Functions from "firebase-functions";
import { LEAGUE_OF_LEGENDS } from "./vars";

export const IS_DEV = process.env.FUNCTIONS_EMULATOR;

type HttpsHandler = Parameters<typeof https.onRequest>[0];

const cors: (handler: HttpsHandler) => HttpsHandler =
  (handler) => (req, res) => {
    const allowedOrigins = IS_DEV
      ? ["http://127.0.0.1:3000", "http://localhost:3000"]
      : ["https://www.tier-survey.xyz"];

    if (!req.headers.origin) {
      res.status(400).send("Cannot recognize origin");
      return;
    }

    const url = allowedOrigins.find((url) => url === req.headers.origin);

    res.header({
      "Access-Control-Allow-Origin": url,
    });

    return handler(req, res);
  };

export const middleware = {
  cors,
};

export const onCustomRequest = (handler: HttpsHandler) =>
  Functions.region("asia-northeast3").https.onRequest(cors(handler));

export const paramCheck = (keys: string | string[], params: Object) => {
  if (typeof keys === 'string') {
    return keys in params;
  }

  return keys.every(_key => _key in params);
}

export function toCamelCase(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

export function getLeagueOfLegendsNumericTier(tier: LeagueOfLegendsTier, rank:LeagueOfLegendsRank) {
  let rankNumeric = 0;

  switch(rank) {
    case "I":
      rankNumeric++;
    case "II":
      rankNumeric++;
    case  "III":
      rankNumeric++;
    case "IV":
      rankNumeric++;
  }

  return LEAGUE_OF_LEGENDS.tierNumericMap[tier] + rankNumeric;
}