import { Timestamp } from "firebase-admin/firestore";
import API from "../api";
import { store } from "../index";
import {
  getLeagueOfLegendsNumericTier,
  onCORSRequest,
  onRequest,
  paramCheck,
} from "../utils";

export const writeUser = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(403).send("Only POST allowed");
    return;
  }

  const { hashedId, user } = JSON.parse(req.body);

  if (!hashedId) {
    res.status(400).send("bad request");
    return;
  }

  try {
    await store.writeUser("league of legends", hashedId, user);
  } catch {
    throw new Error("error while writing user");
  }

  res.status(200).send("Write User Success");
});

export const createSurvey = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["limitMinute", "password", "hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const { password, limitMinute, hashedId } = params;

  if (!hashedId || typeof hashedId !== "string") {
    res.status(403).send("Wrong hashed id");
    return;
  }

  const user = await store.getUser("league of legends", hashedId as string);

  if (!user) {
    res.status(404).send("Cannot found user");
    return;
  }

  try {
    await store.setSurvey("league of legends", hashedId, {
      password: password as string,
      limitMinute: Number(limitMinute),
      startTime: Date.now(),
    });
  } catch {
    throw new Error("Something error while creating new survey");
  }

  try {
    await store.resetChartAndPlayerTable("league of legends", hashedId);
  } catch {
    throw new Error("Something error while setting chart table");
  }

  res.status(200).send("Create Success");
});

export const cancelSurvey = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const { hashedId } = params;

  try {
    await store.writeSurvey("league of legends", hashedId as string, {
      limitMinute: 0,
    });
  } catch {
    throw new Error("error while fixing survey");
  }

  res.status(200).send("Cancel Success");
});

export const getSurvey = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const { hashedId } = params;

  try {
    const chart = await store.getSurvey(
      "league of legends",
      hashedId as string
    );
    res.status(200).send(chart);
  } catch {
    throw new Error("error while fixing survey");
  }
});

type CheckSurveyResponse = {
  status: "open" | "closed" | "undefined";
  data:
    | {
        limitMinute: number;
        startTime: number;
      }
    | undefined;
};
export const checkSurvey = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const { hashedId } = params;

  const data = await store.getSurvey("league of legends", hashedId as string),
    resData: CheckSurveyResponse = {
      status: "undefined",
      data: undefined,
    };

  if (data) {
    const endTime = data.startTime + data.limitMinute * 60 * 1000;

    if (endTime > Date.now()) {
      resData.status = "open";
      resData.data = {
        limitMinute: data.limitMinute,
        startTime: data.startTime,
      };
    } else {
      resData.status = "closed";
    }
  }

  res.status(200).send(resData);
});

export const checkStatExist = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const { hashedId } = params;

  const data = {
    exist: false,
  };

  data.exist = await store.checkStatExist(
    "league of legends",
    hashedId as string
  );

  res.status(200).send(data);
});

export const checkSurveyPassword = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hostHashedId", "password"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hostHashedId = params.hostHashedId as string,
    password = params.password as string;

  const hostSurvey = await store.getSurvey("league of legends", hostHashedId);

  if (!hostSurvey) {
    res.status(404).send("Cannot find survey");
    return;
  }

  const endTime = hostSurvey.startTime + hostSurvey.limitMinute * 60 * 1000;

  if (endTime < Date.now()) {
    // closed
    res.status(200).send({ state: "closed" });
    return;
  }

  if (password !== hostSurvey.password) {
    res.status(403).send({ state: "wrong" });
    return;
  }

  res.status(200).send({ state: "correct" });
});

export const joinSurvey = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId", "hostHashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string,
    hostHashedId = params.hostHashedId as string;

  const [stat, user] = await Promise.all([
    store.getStat("league of legends", hashedId),
    store.getUser("league of legends", hashedId),
  ]);

  if (!stat) {
    res.status(404).send("Cannot find participant stat information");
    return;
  }

  if (!user) {
    res.status(404).send("Cannot find user");
    return;
  }

  const results = await Promise.allSettled([
    store.setChart("league of legends", hostHashedId, stat),
    store.setPlayerTable("league of legends", hostHashedId, hashedId, {
      tierNumeric: stat.tierNumeric,
      flexTierNumeric: stat.flexTierNumeric,
      gameName: user.gameName,
      tagLine: user.tagLine,
      level: user.summonerLevel,
      profileIconId: user.profileIconId,
    }),
  ]);

  if (results.some((r) => r.status === "rejected")) {
    res.status(400).send("Error while saving to player table and chart");
    return;
  }

  res.status(200).send("done");
});

export const checkJoinSurvey = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId", "hostHashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string,
    hostHashedId = params.hostHashedId as string;

  const isExist = await store.checkPlayerTable(
    "league of legends",
    hostHashedId,
    hashedId
  );

  if (isExist) {
    res.status(200).send(true);
  } else {
    res.status(200).send(false);
  }
});

export const saveStat = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["apiType", "hashedId", "hostHashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string,
    hostHashedId = params.hostHashedId as string,
    apiType = params.apiType as LeaugeOfLegendsApiType;

  const user = await store.getUser("league of legends", hashedId);

  if (!user) {
    res.status(404).send("Cannot find user");
    return;
  }

  try {
    await store.initStat("league of legends", hashedId);

    if (apiType === "LEAGUE-V4") {
      const { requestLeagueV4 } = API["league of legends"];
      const data = await requestLeagueV4(user.id);

      let tierNumeric = 0,
        flexTierNumeric = 0;

      data.forEach((info) => {
        if (info.queueType === "RANKED_SOLO_5x5") {
          tierNumeric = getLeagueOfLegendsNumericTier(info.tier, info.rank);
        } else if (info.queueType === "RANKED_FLEX_SR") {
          flexTierNumeric = getLeagueOfLegendsNumericTier(info.tier, info.rank);
        }
      });

      await store.setStat("league of legends", hashedId, {
        tierNumeric,
        flexTierNumeric,
      });
    } else if (apiType === "CHAMPION-MASTERY-V4") {
      const { requestChampionMasteryV4 } = API["league of legends"];
      const data = await requestChampionMasteryV4(user.puuid);

      const champions: LeagueOfLegendsChampion[] = data.map(
        ({ championId, championLevel, championPoints }) => ({
          championId,
          championLevel,
          championPoints,
        })
      );

      await store.setStat("league of legends", hashedId, {
        champions,
      });
    } else if (apiType === "SUMMONER-V4") {
      const { requestSummonerV4 } = API["league of legends"];
      const data = await requestSummonerV4(user.puuid);

      await Promise.allSettled([
        store.setStat("league of legends", hashedId, {
          level: data ? data.summonerLevel : 0,
          updateDate: Timestamp.fromDate(new Date()),
          surveyList: {
            [hostHashedId]: Timestamp.fromDate(new Date()),
          },
        }),
        store.writeUser("league of legends", hashedId, { ...data }),
      ]);
    }

    res.status(200).send("done");
  } catch {
    throw new Error("Error while requesting API or saving data to Firestore");
  }
});

export const getUser = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string;

  const user = await store.getUser("league of legends", hashedId);

  if (!user) {
    res.status(404).send("Cannot found user");
    return;
  }

  const { gameName, profileIconId, summonerLevel } = user;

  res.status(200).send({
    gameName,
    profileIconId,
    summonerLevel,
  });
});

export const getMyInfoFromPlayerTable = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId", "hostHashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string,
        hostHashedId = params.hostHashedId as string;

  const playerTable = await store.getPlayerTable("league of legends", hostHashedId);

  if (!playerTable) {
    res.status(404).send("Cannot found user");
    return;
  }

  if (hashedId in playerTable) {
    res.status(200).send(playerTable[hashedId]);
    return;
  }

  res.status(404).send(undefined);
});

export const getChart = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string;

  const chart = await store.getChart("league of legends", hashedId);

  if (!chart) {
    res.status(404).send("Cannot found chart");
    return;
  }

  const mostLovedChampionTop10 = Object.entries(chart.mostLovedChampion)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  res.status(200).send({
    participantCnt: chart.participantCnt,
    tierCnt: chart.tierCnt,
    flexTierCnt: chart.flexTierCnt,
    totalLevel: chart.totalLevel,
    mostLovedChampionTop10,
    updateDate: chart.updateDate.toMillis(),
  });
});

export const getTop100PlayerTable = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string;

  const playerTable = await store.getTop100PlayerTable(
    "league of legends",
    hashedId
  );

  if (!playerTable) {
    res.status(404).send("Cannot found player table");
    return;
  }

  res.status(200).send(playerTable);
});

export const getMyRanking = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId", "hostHashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string,
        hostHashedId = params.hostHashedId as string;

  const rank = (await store.getMyRanking(
    "league of legends",
    hostHashedId,
    hashedId
  ))!;

  res.status(200).send(rank);
});

export const getJoinedSurvey = onCORSRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string;

  const stat = await store.getStat("league of legends", hashedId);

  if (!stat) {
    res.status(404).send("Cannot found user");
    return;
  }

  const { surveyList } = stat;

  res
    .status(200)
    .send(
      Object.entries(surveyList).map(([id, timestamp]) => ({ id: id, time: timestamp.toMillis() }))
    );
});
