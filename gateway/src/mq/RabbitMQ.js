const amqp = require('amqplib/callback_api');
require('dotenv/config');
const username = process.env.USERNAME_MQ;
const password = process.env.PASSWORD_MQ;
const host = process.env.HOST_MQ;
const { logger } = require('../utils');

module.exports = {

    async emit(msg) {
        amqp.connect(`amqp://${username}:${password}@${host}`, (err, conn) => {
            if (err) {
                logger.info(`falha na conexão da fila: ${err}`);
                return;
            }
            conn.createChannel((err, ch) => {
                if (err) {
                    logger.info(`falha ao criar channel: ${err}`);
                    return;
                }
                ch.assertQueue('gateway-mq', {
                    durable: false
                });
                ch.sendToQueue('gateway-mq', Buffer.from(msg));
                logger.info(` [x] Enviado ${msg}'`);
            });
            setTimeout(() => {
                conn.close();
                process.exit(0)
            }, 500);
        });
    },
    async receive() {
        let conn = await amqp.connect(`amqp://${username}:${password}@${host}`);
        let ch = await conn.createChannel()
        ch.assertExchange('gateway-mq', 'direct', {
            durable: false
        })
        let q = await ch.assertQueue('gateway-mq', {
            exclusive: true
        })
        logger.info(' [*] Aguardando por mensagens')
        ch.consume(q.queue, msg => {
            logger.info(` [x] ${msg.fields.routingKey} - ${msg.content.toString()}`, )
        }, {
            noAck: true
        })
    }

}