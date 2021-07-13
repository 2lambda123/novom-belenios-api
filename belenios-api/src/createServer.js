import express from 'express';
import socketIO from 'socket.io';
import http from 'http';
import fs from 'fs';

import authHelper from './authHelper';
import createElection from './lib/belenios/admin/createElection';
import setVoters from './lib/belenios/admin/setVoters';
import verifyVoters from './lib/belenios/admin/verifyVoters';
import lockVoters from './lib/belenios/admin/lockVoters';
import makeElection from './lib/belenios/admin/makeElection';
import joinElection from './lib/belenios/voter/joinElection';
import vote from './lib/belenios/voter/vote';
import closeElection from './lib/belenios/admin/closeElection';
import computeVoters from './lib/belenios/admin/computeVoters';
import deleteElection from './lib/belenios/admin/deleteElection';
import { ELECTIONS_DIR } from './lib/belenios/global';
import log from './log';

const createServer = (port = 3000) => {
  const expressApp = express();
  const router = express.Router();
  const httpServer = http.Server(expressApp);
  const io = socketIO(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      credentials: true,
    },
    cookie: {
      name: 'io',
      httpOnly: false,
      path: '/',
    },
  });
  const votingQueue = [];

  if (!fs.existsSync(ELECTIONS_DIR)) {
    fs.mkdirSync(ELECTIONS_DIR);
  }

  expressApp.use('/', router);

  httpServer.listen(port);

  io.of('/admin').use((socket, next) => {
    authHelper(socket, 'admin', next);
  });

  io.of('/admin').on('connection', (socket) => {
    socket.on('create-election', createElection);
    socket.on('set-voters', setVoters);
    socket.on('verify-voters', verifyVoters);
    socket.on('lock-voters', lockVoters);
    socket.on('make-election', makeElection);
    socket.on('get-voters-count', (electionId, callback) => {
      const voters = io.of('/voter').adapter.rooms.get(electionId);
      const votersCount = voters ? voters.size : 0;
      callback({ status: 'OK', payload: { nbActiveVoters: votersCount } });
    });
    socket.on('compute-voters', computeVoters);
    socket.on('close-election', closeElection);
    socket.on('delete-election', deleteElection);
  });

  io.of('/voter').use((socket, next) => {
    authHelper(socket, 'voter', next);
  });

  io.of('/voter').on('connection', (socket) => {
    socket.on('join-election', (electionId, userId, callback) => {
      joinElection(electionId, userId, socket, callback);
    });
    socket.on('vote', (electionId, ballot, callback) => {
      votingQueue.push({ func: vote, params: [electionId, socket.privCred, ballot, callback] });
    });
  });

  setInterval(() => {
    votingQueue.splice(0, 5).forEach(({ func, params }) => {
      func(...params);
    });
  }, 500);

  log('info', `Server started on port ${port}`);
};

export default createServer;
