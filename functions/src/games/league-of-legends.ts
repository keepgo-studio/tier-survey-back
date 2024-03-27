import { store } from "..";
import { onCustomRequest, paramCheck } from "../utils";

export const createSurvey = onCustomRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["limitMinute", "password", "hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const { password, limitMinute, hashedId } = params;

  // TODO catch - if no hashed Id from firestore users -> return error
  
  if (!hashedId || typeof hashedId !== "string") {
    res.status(403).send("Wrong hashed id");
    return;
  }

  const result = await store.setSurvey(hashedId, 'league of legends', {
    password: password as string,
    limitMinute: Number(limitMinute),
    endTime: Date.now() + Number(limitMinute) * 60 * 1000
  });

  if (result) {
    res.status(200).send("Create Success");
    return;
  }
  
  res.status(500).send("Something error while `setSurvey`");
});


type SurveyClient = {
  limitMinute: number;
  endTime: number;
};
type CheckSurveyResponse = {
  status: "open" | "closed" | "undefined",
  data: SurveyClient | undefined;
};

export const checkSurvey = onCustomRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck(["hashedId"], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const { hashedId } = params;

  const data = await store.getSurvey(hashedId as string, "league of legends"),
        resData: CheckSurveyResponse = {
          status: "undefined",
          data: undefined
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

// export const saveUser = onCustomRequest((req, res) => {
//   const
// await riot api - /acounts/me
// })
