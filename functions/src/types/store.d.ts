type StatParam = {
  "league of legends": Partial<FS_LeagueOfLegendsStat>;
  "teamfight tactics": {};
  "valorant": {};
}

type StatParamMap<T extends SupportGame> = StatParam[T];

type StatReturn = {
  "league of legends": FS_LeagueOfLegendsStat
  "teamfight tactics": {};
  "valorant": {};
}

type StatReturnMap<T extends SupportGame> = StatReturn[T];

// type LeagueOfLegendsApiParam = {
//   "SUMMONER-V4": {
//     userLevel: number;
//   },
//   "LEAGUE-V4": {
//     tier: LeagueOfLegendsTier;
//   },
//   "CHAMPION-MASTERY-V4": {
//     champions: LeagueOfLegendsChampion[];
//   }
//   "GEO-LOCATION": {}
// };

// type LeagueOfLegendsApiParamMap<T extends LeaugeOfLegendsApiType> = LeagueOfLegendsApiParam[T];

type ChartParam = {
  "league of legends": FS_LeagueOfLegendsStat
  "teamfight tactics": {};
  "valorant": {};
}

type ChartParamMap<T extends SupportGame> = ChartParam[T];