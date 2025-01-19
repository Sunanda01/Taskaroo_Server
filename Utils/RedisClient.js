const RedisURL=require('../Config/config').REDIS_URL;
const Redis = require("ioredis");
const client = new Redis(RedisURL);
module.exports=client;