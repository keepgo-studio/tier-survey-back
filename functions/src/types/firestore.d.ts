type SupportGame = "league of legends" | "teamfight tactics" | "valorant";

// OAuth types
type NaverHashedId = string;

type RSOHashedPUUId = string;


// FS_ prefix == FireStore
// firestore collections - global
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
  "rso": RSOHashedPUUId
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
  startTime: number;
  limitMinute: number;
};