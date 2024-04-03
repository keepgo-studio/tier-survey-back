// game types
// 1. league of legends types
type LeagueOfLegendsChampionId = number;

type LeagueOfLegendsChampion = {
  championId: LeagueOfLegendsChampionId;
  championLevel: number;
  championPoints: number;
};

type LeagueOfLegendsTier =
  | "CHALLENGER"
  | "GRANDMASTER"
  | "MASTER"
  | "DIAMOND"
  | "EMERALD"
  | "PLATINUM"
  | "GOLD"
  | "SILVER"
  | "BRONZE"
  | "IRON";

type LeagueOfLegendsRank = "I" | "II" | "III" | "IV";

/** tier + rank를 합친 정수 값 */
type LeagueOfLegendsChampionTierNumeric = number;

type LeaugeOfLegendsApiType =
  | "SUMMONER-V4"
  | "LEAGUE-V4"
  | "CHAMPION-MASTERY-V4"
  | "GEO-LOCATION";