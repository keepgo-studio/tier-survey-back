type SupportGame = "league of legends" | "teamfight tactics" | "valorant";

// FS_ prefix == FireStore
// firestore collections - global

/**
 * ## survey
 * - collection: {@link SupportGame}-survey
 * - id: {@link RSOHashedPUUId}
 * - desc: 열린 설문조사 정보를 담는 collection
 *  naver id를 기준으로 설문조사를 만듬 
 *  gamename에 따라 collection에 진입하므로 동시에 여러 게임 설문 조사가 가능함
 */
type FS_Survey = {
  password: string;
  startTime: number;
  limitMinute: number;
};