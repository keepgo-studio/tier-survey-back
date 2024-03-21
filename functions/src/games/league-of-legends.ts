import { getFirestore } from "firebase-admin/firestore";
import { onCustomRequest, paramCheck } from "../utils";

// asia-northeast3
export const createSurvey = onCustomRequest(async (req, res) => {
  const params = req.query;

  if (!paramCheck([
    "limitMinute", 
    "keyword",
    "hashedId"
  ], params)) {
    res.status(400).send("Wrong parameter");
    return;
  }

  const { keyword, limitMinute, hashedId } = params;
  const endTime = Date.now() + Number(limitMinute) * 60 * 1000;
  const db = getFirestore();

  // const { hashedId } = await db.collection('users').where('hashedId', '==', params['hashedId']).get();
  // [ ] catch - if no hashed Id -> return error
  if (!hashedId || typeof hashedId !== 'string') {
    res.status(403).send("Wrong hashed id");
    return;
  }

  const surveyRef = db.collection(`${'leagueOfLegends'}-survey`).doc(hashedId);

  await surveyRef.set({
    hashedId,
    keyword,
    limitMinute,
    endTime
  });

  res.status(200).send("Create Success");
});

// 열려 있거나, 닫혀 있거나, 아예 없거나
// export const checkSurvey = 

// export const saveUser = onCustomRequest((req, res) => {
//   const 
// await riot api - /acounts/me
// })
