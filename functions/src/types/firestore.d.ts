type SupportGame = "league of legends" | "teamfight tactics" | "valorant";

// OAuth types
type NaverHashedId = string;

type RSOHashedId = string;


// FS_ prefix == FireStore
// firestore collections - global
type FS_SupportCollectionType = "users" | "survey" | "stat" | "chart" | "chart-ready" | "player-table";
/**
 * ## user
 * - collection: users
 * - id: {@link NaverHashedId}
 * - desc: naver 로그인 후 저장되는 정보
 *  host든 participant든 naver Oauth후 모두 여기 먼저 등록됌
 * 
 * @deprecated
 * 치지직 profile 정보를 받아오는 api가 뚫리지 않은 이상 의미가 없음(https://comm-api.game.naver.com/nng_main/v1/profile/)
 */
type FS_User = {
  "rso": RSOHashedId
  "naver": {}
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


// firestore collections - league of legends related
/**
 * ## users
 * - collection: leagueOfLegends-users
 * - id: {@link RSOHashedId}
 * - desc: RSO 후 가장 먼저 등록되는 데이터
 *  받아온 id 를 hashed하여 이를 collection의 primary key로 사용하였다.
 */
type FS_LeagueOfLegendsUser ={
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
  hashedId: RSOHashedId;
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
  tierNumeric: LeagueOfLegendsChampionTierNumeric;
  level: number;
  champions: LeagueOfLegendsChampion[];
  surveyList: Record<RSOHashedId, Date>; // 참여한 설문 리스트들
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
  tierCnt: Record<LeagueOfLegendsTier | "UNRANK", number>;
  totalLevel: number;
  mostLovedChampion: Record<LeagueOfLegendsChampionId, number>;
  updateDate: Date;
};

/**
 * ## league of legends player table
 * - collection: leagueOfLegends-player-table
 * - id: {@link RSOHashedId}
 * - desc: 티어순으로 저장하는 유저 테이블, row는 {@link FS_LeagueOfLegendsStat}.
 *  최대 100명까지 저장
 *  firestore에 있는 함수, query의 orderBy, startAt, in연산자를 이용해 조회
 */
type FS_LeagueOfLegendsPlayerTable = Record<RSOHashedId, LeagueOfLegendsChampionTierNumeric>;