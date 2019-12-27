const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const expressMetrics = require('express-metrics');
const { httpLogger } = require('./middlewares');
const { logger } = require('./utils');
require('dotenv/config');

const server = express();

server.use('/healthcheck', require('express-healthcheck')());
server.use(httpLogger);
server.use(cors());
server.use(express.json());
server.use(routes);
server.use(expressMetrics({
    port: process.env.PORT_METRICS
}));


server.listen(process.env.PORT, () => {
    logger.info(`Gateway iniciado na porta ${process.env.PORT}`);
});
