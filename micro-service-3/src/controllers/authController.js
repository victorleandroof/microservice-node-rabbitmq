const bcrypt = require('bcryptjs');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const sha256 = require('sha256');
const redisClient = require('../config/redisClient');
const User = require('../models/user');
const Response = require('../middlewares/response');
require('dotenv').config();
const path = require('path');
const privateKey = fs.readFileSync(path.join(__dirname,'..',process.env.PRIVATE_KEY_FILE));
module.exports = {
   login(req, res) {
    const { email, password, config } = req.body;

    if (!email || !password) {
      const fields = [];
      if (!email) fields.push('email');
      if (!password) fields.push('password');

      res.statusCode = 400;
      res.send(new Response('Required fields not present', res.statusCode, fields));
      return;
    }

    User.findOne({
      email
    }, (err, data) => {
      if (err || !data) {
        res.statusCode = 400;
        res.send(new Response('Cannot retrieve data', res.statusCode, 'User does not exist').getStructuredResponse());
        return;
      }
      const validPassword = bcrypt.compareSync(password, data.password);
      if (!validPassword) {
        res.statusCode = 401;
        res.send(new Response('Password does not match', res.statusCode).getStructuredResponse());
        return;
      }

      let exp = Math.floor(Date.now() / 1000) + 60 * 60; 
      let sub;

      if (config) {
        if ('exp' in config) {
          exp = Number(config.exp); 
          if (
            exp > Math.floor(Date.now() / 1000) + 60 * 60 * 12 ||
            exp < Math.floor(Date.now() / 1000) + 60 * 60
          ) {
            res.statusCode = 400;
            res.send(
              new Response(
                'Expiration time in UTC must be between 1 hour and 12 hours',
                res.statusCode,
              ).getStructuredResponse(),
            );
            return;
          }
        }
        if ('sub' in config) {
          sub = config.sub; 
        }
      }

      const jti = uuidv4();
      const token = jwt.sign({
          id: data._id,
          jti,
          sub,
          role: data.role,
          iat: Math.floor(Date.now() / 1000),
          exp,
        },
        privateKey, {
          algorithm: 'RS256'
        },
      );

      redisClient.hset(data._id, [jti, sha256(token), `exp-${jti}`, exp], error => {
        if (error) {
          res.statusCode = 500;
          res.send(new Response('Cannot set token in Redis', res.statusCode, error));
          return;
        }
        res.send(new Response({
          token
        }).getStructuredResponse());
      });
    });
  },
   forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      res.statusCode = 400;
      res.send(new Response('Email is required', res.statusCode).getStructuredResponse());
      return;
    }
    User.findOne({
      email
    }, (err, data) => {
      if (err || !data) {
        res.statusCode = 400;
        res.send(new Response('Cannot find the user', res.statusCode, err || 'User does not exist').getStructuredResponse());
        return;
      }

      User.findOneAndUpdate({
        email
      }, {
        resetPassword: uuidv4()
      }, {
        new: true
      }, error => {
        if (error) {
          res.statusCode = 500;
          res.send(new Response('Cannot update resetPassword field', res.statusCode, error).getStructuredResponse());
          return;
        }
        res.send(new Response('Confirmation email sent successfully').getStructuredResponse());
      });
    });
  },
   resetPassword(req, res) {
    const { email, password, resetPassword } = req.body;
    const {
      id
    } = req.params;

    if (!email || !password || !resetPassword) {
      const fields = [];
      if (!email) fields.push('email');
      if (!password) fields.push('password');
      if (!resetPassword) fields.push('resetPassword');

      res.statusCode = 400;
      res.send(new Response('Required fields not present', res.statusCode, fields).getStructuredResponse());
      return;
    }

    if (password !== resetPassword) {
      res.statusCode = 400;
      res.send(new Response('password and resetPassword does not match', res.statusCode).getStructuredResponse());
      return;
    }

    User.findOne({
      email
    }, (err, data) => {
      if (err || !data) {
        res.statusCode = 400;
        res.send(new Response('Cannot find user', res.statusCode, err || 'User does not exist').getStructuredResponse());
        return;
      }

      if (id !== data.resetPassword) {
        res.statusCode = 400;
        res.send(new Response('Invalid or Expired URL id', res.statusCode).getStructuredResponse());
        return;
      }

      User.findOneAndUpdate({
          email
        }, {
          resetPassword: null,
          password: bcrypt.hashSync(password)
        }, {
          new: true
        },
        error => {
          if (error) {
            res.statusCode = 500;
            res.send(new Response('Could not reset password', res.statusCode, error).getStructuredResponse());
            return;
          }

          // Some other logic to acknowledge user about the password change goes here.

          res.send(new Response('Password Updated Successfully').getStructuredResponse());
        },
      );
    });
  },
   logout(req, res) {
    redisClient.hdel(req.user.id, [req.user.jti, `exp-${req.user.jti}`], err => {
      if (err) {
        res.statusCode = 500;
        res.send(new Response('Could not delete key', res.statusCode).getStructuredResponse());
        return;
      }
      res.send(new Response('Successfully deleted the key').getStructuredResponse());
    });
  },
   verify(req, res) {
    res.send(new Response('token is valid').getStructuredResponse());
  }
}