type SupportGame = "league of legends" | "teamfight tactics" | "valorant";

// OAuth types
type NaverHashedId = string;

type RSOHashedId = string;



// game types
// 1. league of legends types
type LeagueOfLegendsChampionId = string;
/** tier + rank를 합친 정수 값 */
type LeagueOfLegendsChampionTierNumeric = number;
type LeagueOfLegendsChampion = {
  championId: LeagueOfLegendsChampionId;
  championLevel: 7;
  championPoints: 181545;
};
type LeagueOfLegendsTier =
  | "CHALLENGER" // 37
  | "GRANDMASTER" // 33
  | "MASTER" // 29
  | "DIAMOND" // 25
  | "EMERALD" // 21
  | "PLATINUM" // 17
  | "GOLD" // 13
  | "SILVER" // 9
  | "BRONZE" // 5
  | "IRON"; // 1



// firestore types
// FS_ prefix == FireStore
type FS_SupportCollectionType = "users" | "survey" | "stat" | "chart" | "chart-ready" | "player-table";
/**
 * ## user
 * - collection: users
 * - id: {@link NaverHashedId}
 * - desc: naver 로그인 후 저장되는 정보
 *  host든 participant든 naver Oauth후 모두 여기 먼저 등록됌
 */
type FS_User = {
  "rso": {
    // id: string;
    // accountId: string;
    // puuid: string;
    // name: string;
    // profileIconId: number;
    // revisionDate: number;
    // summonerLevel: number;
    hashedId: RSOHashedId;
  };
}

/**
 * ## survey
 * - collection: {@link SupportGame}-survey
 * - id: {@link RSOHashedId}
 * - desc: 열린 설문조사 정보를 담는 collection
 *  naver id를 기준으로 설문조사를 만듬 
 *  gamename에 따라 collection에 진입하므로 동시에 여러 게임 설문 조사가 가능함
 */
type FS_Survey = {
  password: string;
  limitMinute: number;
  endTime: number;
};

/**
 * ## league of legends stat
 * - collection: leagueOfLegends-stat
 * - id: {@link RSOHashedId}
 * - desc: 유저가 권한을 승인함으로써 내놓은 정보들
 *  여기에 모두 저장완료하면 chart, player-table(티어 기준으로)에 저장
 *  네이버 로그인 여부와 상관없이 RSO후 저장해야함
 */
type FS_LeagueOfLegendsStat = {
  tier: string;
  level: number;
  champions: LeagueOfLegendsChampion[];
  surveyList: RSOHashedId[]; // 참여한 설문 리스트들
  updateDate: Date;
  geo: { latitude: number; longitude: number } | null;
};

/**
 * ## league of legends chart
 * - collection: leagueOfLegends-chart
 * - id: {@link RSOHashedId}
 * - desc: **종합한 정보들**을 기록한 데이터
 *  transaction read를 사용하여 항상 최신값을 받아오게
 */
type FS_LeagueOfLegendsChart = {
  participantCnt: number;
  tierCnt: Record<LeagueOfLegendsTier, number>;
  totalLevel: number;
  mostLovedChampion: Record<LeagueOfLegendsChampionId, number>;
  updateDate: Date;
};

/**
 * ## league of legends chart ready
 * - collection: leagueOfLegends-chart-ready
 * - id: {@link RSOHashedId}
 * - desc: 차트가 현재 완성되어 있는지 확인 (사실 그냥 endTime 되면 이 값이 바뀜)
 *  cloud tasks를 사용하여 endTime이 될 때 이 값이 딱 바뀜
 */
type FS_LeagueOfLegendsChartReady = boolean;

/**
 * ## league of legends player table
 * - collection: leagueOfLegends-player-table
 * - id: {@link RSOHashedId | }
 * - desc: 티어순으로 저장하는 유저 테이블, row는 {@link FS_LeagueOfLegendsStat}.
 *  최대 100명까지 저장
 *  firestore에 있는 함수, query의 orderBy, startAt, in연산자를 이용해 조회
 */
type FS_LeagueOfLegendsPlayerTable = {
  players: Record<RSOHashedId, LeagueOfLegendsChampionTierNumeric>;
}