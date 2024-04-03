export interface ChartDataMap {
  "SUMMONER-V4": {
    userLevel: number;
  },
  "LEAGUE-V4": {
    tier: LeagueOfLegendsTier;
  },
  "CHAMPION-MASTERY-V4": {
    champions: LeagueOfLegendsChampion[];
  }
  "GEO-LOCATION": {}
};

export type ChartDataMapParam<T extends LeaugeOfLegendsApiType> = ChartDataMap[T];