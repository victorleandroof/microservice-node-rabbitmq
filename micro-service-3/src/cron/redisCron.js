const Cron = require('cron');
const client = require('../config/redisClient');
const { logger } = require('../utils');
require('dotenv').config();

const { CronJob } = Cron;

new CronJob(process.env.CRON_REDIS, () => {
  client.keys('*', (err, keys) => {
    for (let i = 0; i < keys.length; i += 1) {
      client.hgetall(keys[i], (error, response) => {
        if (err) {
          logger.info(err);
          return;
        }
        Object.keys(response).map(key => {
          if (key.includes('exp-')) {
            if (Number(response[key]) < Math.floor(Date.now() / 1000)) {
              client.hdel(keys[i], [key.split('exp-')[1], key], e => {
                if (e) {
                  logger.info(e);
                }
              });
            }
          }
        });
      });
    }
  });
}, null, true);
