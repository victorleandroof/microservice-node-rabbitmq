const { logger } = require('../utils');
const redis =  require('redis');
require('dotenv/config');
const client = redis.createClient(process.env.REDISCLOUD_URL);

client.on('error', err => {
  logger.info(err);
});

client.on('connect', () => {
  logger.info('conectado ao redis');
});

module.exports = client;
