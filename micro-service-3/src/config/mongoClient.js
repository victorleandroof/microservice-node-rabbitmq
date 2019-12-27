const mongoose = require('mongoose');
const { logger } = require('../utils');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', (err)=>{
  logger.info(err)
});
db.once('open', () => {
  logger.info('conectado ao db');
});
