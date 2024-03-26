// FS_ prefix == FireStore

type SupportGame = "league of legends" | "teamfight tactics" | "valorant";

type RSOHashedId = string;


// # league of legends
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

/**
 * ## user
 * - id: {@link RSOHashedId}
 * - desc: RSO 후 저장되는 유저 정보
 */
type FS_RSOUser = {
  // id: string;
  // accountId: string;
  // puuid: string;
  // name: string;
  // profileIconId: number;
  // revisionDate: number;
  // summonerLevel: number;
  hashedId: RSOHashedId;
};

/**
 * ## survey
 * - id: {@link RSOHashedId}
 * - desc: 열린 설문조사 정보를 담는 collection
 *  RSO계열 아이디 혹은 다른 게임들의 id를 기준으로 설문조사를 만듬 (동시에 여러 설문 조사가 가능하도록)
 */
type FS_Survey = {
  game: SupportGame;
  keyword: string;
  limitMinute: number;
  endTime: number;
};

/**
 * ## league of legends stat
 * - id: {@link RSOHashedId}
 * - desc: 유저가 권한을 승인함으로써 내놓은 정보들
 *  여기에 모두 저장완료하면 chart, player-table(티어 기준으로)에 저장
 */
type FS_LeagueOfLegendsStat = {
  tier: string;
  level: number;
  champions: LeagueOfLegendsChampion[];
  surveyList: RSOHashedId[]; // 참여한 설문 리스트들
  updateDate: Date;
};

/**
 * ## league of legends chart
 * - id: {@link RSOHashedId}
 * - desc: **종합한 정보들**을 기록한 데이터
 */
type FS_LeagueOfLegendsChart = {
  participantCnt: number;
  tierCnt: Record<LeagueOfLegendsTier, number>;
  totalLevel: number;
  mostLovedChampion: Record<LeagueOfLegendsChampionId, number>;
  updateDate: Date;
};

/**
 * ## league of legends player table
 * - id: {@link RSOHashedId}
 * - desc: 티어순으로 저장하는 유저 테이블, row는 {@link FS_LeagueOfLegendsStat}.
 *  최대 100명까지 저장
 *  firestore에 있는 함수, query의 orderBy, startAt, in연산자를 이용해 조회
 */
type FS_LeagueOfLegendsPlayerTable = {
  players: Record<RSOHashedId, LeagueOfLegendsChampionTierNumeric>;
}