const users = require('./userRouter');
const auth = require('./authRouter');

const routes = server => {
  server.use('/v1/users', users);
  server.use('/v1/auth', auth);
};

module.exports = routes;
