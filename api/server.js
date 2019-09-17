const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session) // currying

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const dbConnection = require('../database/dbConfig')

const server = express();

const sessionConfig = {
  name: 'chocochip', // would name the cookie sid by default
  secret: process.env.SESSION_SECRET || 'keep it secret, keep it safe',
  cookie: {
    maxAge: 1000 * 60 * 60, // in ms, sets how long the cookie will last
    secure: process.env.COOKIE_SECURE || false, // true means only send cookie over https
    httpOnly: true, // true means JS has no access to the cookie
  },
  resave: false,
  saveUninitialized: true, // deals with saving cookies, set to false for GDPR compliance (EU laws)
  store: new KnexSessionStore({ // configures session to the database to persist
    knex: dbConnection, // a knex file that is connected to the database
    tablename: 'knexsessions', // defaults to sessions
    sidfieldname: 'sessionid',
    createtable: true,
    clearInterval: 1000 * 60 * 30, // in ms, cleans out expired session data
  })
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig))

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.json({ api: 'up' });
});

module.exports = server;
