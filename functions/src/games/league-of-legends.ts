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

  const surveyResult = await store.setSurvey("league of legends", hashedId, {
    password: password as string,
    limitMinute: Number(limitMinute),
    endTime: Date.now() + Number(limitMinute) * 60 * 1000,
  });

  if (!surveyResult) {
    res.status(500).send("Something error while creating new survey");
    return;
  }

  const chartResult = await store.resetChartAndPlayerTable("league of legends", hashedId);

  if (!chartResult) {
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


export const saveLeagueOfLegendsStat = onCustomRequest(async (req, res) => {
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

  // [ ] check already join

  // await store.setSurvey("league of legends", hostHashedId);

  await store.initStat("league of legends", hashedId);

  if (apiType === 'LEAGUE-V4') {
    const { requestLeagueV4 } = API["league of legends"];
    const data = await requestLeagueV4(user.id);

    if (data.length > 0) {
      const soloRank = data[0];

      await Promise.all([
        store.setStat("league of legends", hashedId, {
          tierNumeric: getLeagueOfLegendsNumericTier(
            soloRank.tier,
            soloRank.rank
          )
        }),
        store.writeToLeagueOfLegendsChart(hostHashedId, "LEAGUE-V4", {
          tier: soloRank.tier,
        })
      ]);
    }
  } else if (apiType === 'CHAMPION-MASTERY-V4') {
    const { requestChampionMasteryV4 } = API["league of legends"];
    const data = await requestChampionMasteryV4(user.puuid);

    const champions: LeagueOfLegendsChampion[] = data.map(({ championId, championLevel, championPoints}) => ({
      championId,
      championLevel,
      championPoints
    }));

    await Promise.all([
      store.setStat("league of legends", hashedId, {
        champions
      }),
      store.writeToLeagueOfLegendsChart(hostHashedId, "CHAMPION-MASTERY-V4", {
        champions
      })
    ]);
  } else if (apiType === 'SUMMONER-V4') {
    const { requestSummonerV4 } = API["league of legends"];
    const data = await requestSummonerV4(user.puuid);

    if (!data) {
      res.status(404).send("Cannot get summoner-v4");
      return;
    }

    await Promise.all([
      store.setStat("league of legends", hashedId, {
        level: data.summonerLevel,
        updateDate: new Date(),
        surveyList: {
          [hostHashedId]: new Date()
        }
      }),
      store.writeToLeagueOfLegendsChart(hostHashedId, "SUMMONER-V4", {
        userLevel: data.summonerLevel
      })
    ]);
  }

  res.status(200).send("done");
});
