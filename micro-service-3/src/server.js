const express = require('express');
const cors = require('cors');
const expressMetrics = require('express-metrics');
const { httpLogger } = require('./middlewares');
const routes = require('./routes')
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { logger } = require('./utils');
const mongoClient = require('./config/mongoClient');
require('dotenv/config');

const server = express();
server.use('/healthcheck', require('express-healthcheck')());
server.use(httpLogger);
server.use(cors());
server.use(helmet())
server.use(express.json());
server.use(cookieParser());
server.use(expressMetrics({
    port: process.env.PORT_METRICS
}));
routes(server);

server.listen(process.env.PORT, () => {
    logger.info(`micro-service-3 iniciado na porta ${process.env.PORT}`);
});
