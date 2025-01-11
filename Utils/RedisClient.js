const RedisURL=require('../Config/config').Redis_URL;
const Redis = require("ioredis");
const client = new Redis(RedisURL);
module.exports=client;