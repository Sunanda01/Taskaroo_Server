const Redis = require("ioredis");
const client = new Redis("rediss://default:Ac8EAAIjcDE3MGE3NWRmNzQxMTM0MzRiYTAxOTExNDNmMjgxMDAwM3AxMA@tidy-man-52996.upstash.io:6379");
module.exports=client;