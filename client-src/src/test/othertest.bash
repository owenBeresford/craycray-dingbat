curl -d '[ { "name":"AAA", "created":1654785963519 , "edited": 1654785963519 , "count":3, "id":1, "list":["aa", "bb", "cc", "dd", "ee"]},{ "name":"BBB", "created": 1654785963519 , "edited":1654785963519  , "count":3,"id":2,"list":["aa", "bb", "cc", "dd", "ee"] }]' -H "Content-Type:application/json" -X POST http://192.168.0.35:3001/api/shared-state

