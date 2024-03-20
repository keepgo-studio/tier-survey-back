[ ] RSO 구현할 때 access token, refresh token을 넘겨줄 때 암호화해서 넘겨주기, id는 hash홰서 넘겨주기

- collection 및 document 위치 - game 명 / ...
  
  e.g leagueOfLegends-users/{hashedId}

# collections

## users 

- desc: user rso 정보를 담는 collection (qr/client 통해 들어왔다면 이 정보는 저장되어있지 않음)
 
```js
  {
    "id": // string,
    "accountId": // string,
    "puuid": // string,
    "name": // string,
    "profileIconId": // number,
    "revisionDate": // number,
    "summonerLevel": // number,
    "hashedId": // "id"를 해시한 값
  }
```

## survey 

- id: hashedId
- desc: 열린 설문조사 정보를 담는 collection

```js
  {
    "hashedId": // "id"를 해시한 값, 누가 열었는지 확인하기 위핢
    "keyword": 
    "limitMinute": 
    "endTime": 
  }
```

## stat 

- desc: 유저가 권한을 승인함으로써 내놓은 정보들 

  여기에 모두 저장완료하면 chart, player-table(티어 기준으로)에 저장

```js
  {
    clientHashedId: // "id"를 해시한 값 
    tier: 
    level: 
    champions: [],
    hashedId: [] // 참여한 설문 id
  }
```

## chart
- id: hashedId
- desc: 

```js
  {
    "participant":
    "tier": {
      ...
      'silver': // number
      'iron': // number
    }
    "totalLevel": // number
    "mostLovedChampion": {
      "champCode1": // number
      "champCode2": // number
      "champCode3": // number
      ...
    }
  }
```

## player-table 
- id: hashedId
- desc: firestore에 있는 함수, query의 orderBy, startAt, in연산자를 이용해 조회

```js
  {
    "host": hashedId
    "players": [
      // hashedId reference - 티어 순으로 넣는 queue
    ]
  }
```
