import { Timestamp } from "firebase-admin/firestore";
import API from "../api/api";
import { store } from "../index";
import {
  getLeagueOfLegendsNumericTier,
  onCustomRequest,
  paramCheck,
} from "../utils";


export const createSurvey = onCustomRequest(async (req, res) => {
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
      endTime: Date.now() + Number(limitMinute) * 60 * 1000,
    });
  } catch {
    res.status(500).send("Something error while creating new survey");
    return;
  }

  try {
    await store.resetChartAndPlayerTable("league of legends", hashedId);
  } catch {
    res.status(500).send("Something error while setting chart table");
    return;
  }

  res.status(200).send("Create Success");
});


type CheckSurveyResponse = {
  status: "open" | "closed" | "undefined";
  data: {
    limitMinute: number;
    endTime: number;
  } | undefined;
};


export const checkSurvey = onCustomRequest(async (req, res) => {
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
    if (data.endTime > Date.now()) {
      resData.status = "open";
      resData.data = {
        limitMinute: data.limitMinute,
        endTime: data.endTime,
      };
    } else {
      resData.status = "closed";
    }
  }

  res.status(200).send(resData);
});


export const joinSurvey = onCustomRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId", "hostHashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string,
        hostHashedId = params.hostHashedId as string;

  const hostSurvey = await store.getSurvey("league of legends", hostHashedId);

  if (!hostSurvey) {
    res.status(404).send("Cannot find survey");
    return;
  }

  const stat = await store.getStat("league of legends", hashedId);

  if (!stat) {
    res.status(404).send("Cannot find participant stat information");
    return;
  }

  
  const results = await Promise.allSettled([
      store.setChart("league of legends", hostHashedId, stat),
      store.setPlayerTable("league of legends", hostHashedId, hashedId, stat.tierNumeric)
    ]);
  
  if (results.some(r => r.status === "rejected")) {
    res.status(400).send("Error while saving to player table and chart");
    return;
  }

  res.status(200).send("done");
});


export const checkJoinSurvey = onCustomRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId", "hostHashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const hashedId = params.hashedId as string,
        hostHashedId = params.hostHashedId as string;

  const isExist = await store.checkPlayerTable("league of legends", hostHashedId, hashedId);

  if (isExist) {
    res.status(200).send(true);
  } else {
    res.status(200).send(false);
  }
});


export const saveStat = onCustomRequest(async (req, res) => {
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

  await store.initStat("league of legends", hashedId);

  if (apiType === 'LEAGUE-V4') {
    const { requestLeagueV4 } = API["league of legends"];
    const data = await requestLeagueV4(user.id);

    const tierNumeric = data.length > 0 ? getLeagueOfLegendsNumericTier(data[0].tier, data[0].rank) : 0;

    await store.setStat("league of legends", hashedId, {
      tierNumeric
    });
  } else if (apiType === 'CHAMPION-MASTERY-V4') {
    const { requestChampionMasteryV4 } = API["league of legends"];
    const data = await requestChampionMasteryV4(user.puuid);

    const champions: LeagueOfLegendsChampion[] = data.map(({ championId, championLevel, championPoints}) => ({
      championId,
      championLevel,
      championPoints
    }));

    await store.setStat("league of legends", hashedId, {
      champions
    });
  } else if (apiType === 'SUMMONER-V4') {
    const { requestSummonerV4 } = API["league of legends"];
    const data = await requestSummonerV4(user.puuid);

    await store.setStat("league of legends", hashedId, {
      level: data ? data.summonerLevel : 0,
      updateDate: Timestamp.fromDate(new Date()),
      surveyList: {
        [hostHashedId]: Timestamp.fromDate(new Date())
      }
    });
  }

  res.status(200).send("done");
});


export const getUser = onCustomRequest(async (req, res) => {
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

  const { name, profileIconId, summonerLevel } = user;
  
  res.status(200).send({
    name,
    profileIconId,
    level: summonerLevel,
  });
});



export const getStat = onCustomRequest(async (req, res) => {
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

  const { tierNumeric, champions } = stat;
  
  res.status(200).send({
    tierNumeric,
    champions
  });
});


export const getChart = onCustomRequest(async (req, res) => {
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

  res.status(200).send({
    ...chart,
    updateDate: chart.updateDate.toDate()
  });
});