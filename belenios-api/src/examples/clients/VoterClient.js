//--------------------------------------------------------------------------------
// AdminCLient
// Example of a voter client that output that vote to an election.
//--------------------------------------------------------------------------------

/* eslint-disable no-console */
import io from 'socket.io-client';
import jsonwebtoken from 'jsonwebtoken';

const DEFAULT_ELECTION_ID = 'P2N684xYV1CQ2j';
const url = 'http://localhost:8043/voter';
const voter = 'voter97';

console.log('Voter Client');
console.log('Url: ', url);
console.log('Election: ', DEFAULT_ELECTION_ID);
console.log('Voter: ', voter);

const socket = io(url, {
  rejectUnauthorized: false,
  auth: {
    authToken: jsonwebtoken.sign(
      { extraPayload: { ticketId: 'invitationId' } },
      process.env.JWT_SECRET,
      {
        algorithm: process.env.JWT_ALGO,
        expiresIn: 60,
      },
    ),
  },
});

socket.on('connect_error', (err) => {
  console.log(err);
  socket.disconnect();
});

socket.on('connect', () => {
  console.log('connected');

  setInterval(() => {
    socket.emit('refreshAuthToken', jsonwebtoken.sign(
      { extraPayload: { ticketId: 'invitationId' } },
      process.env.JWT_SECRET,
      {
        algorithm: process.env.JWT_ALGO,
        expiresIn: 15,
      },
    ), ({ status }) => { console.log(status); });
  }, 8000);

  socket.emit('join-election', DEFAULT_ELECTION_ID, voter, (joinElection) => {
    console.log('join-election', joinElection);
    const ballot = JSON.stringify([[1, 0], [1, 0, 0]]);
    socket.emit('vote', DEFAULT_ELECTION_ID, ballot, (vote) => {
      console.log('vote', vote);
    });
  });
});

socket.on('disconnect', () => {
  console.log('disconnected');
});
