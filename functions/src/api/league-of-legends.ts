async function rsoFetch(url: string) {
  return fetch(url, {
    headers: {
      "X-Riot-Token": process.env.API_KEY
    }
  });
}

type ChampionMasteryDto = {
  puuid: string;
  championId: LeagueOfLegendsChampionId;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
  summonerId: string;
}

export async function requestChampionMasteryV4(encryptedPUUID: string): Promise<Array<ChampionMasteryDto>> {
  return await rsoFetch(`https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}/top`)
    .then(res => res.json())
    .catch(() => []);
}

type LeagueEntryDTO = {
  leagueId: string;
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
  tier: LeagueOfLegendsTier;
  rank: LeagueOfLegendsRank;
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export async function requestLeagueV4(encryptedSummonerId: string): Promise<Array<LeagueEntryDTO>> {
  return await rsoFetch(`https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`)
    .then(res => res.json())
    .catch(() => []);
}

export async function requestSummonerV4(encryptedPUUID: string): Promise<{
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
} | undefined> {
  return await rsoFetch(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`)
    .then(res => res.json())
    .catch(() => undefined);
}
