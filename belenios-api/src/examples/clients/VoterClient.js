import io from 'socket.io-client';
import jsonwebtoken from 'jsonwebtoken';

const DEFAULT_EVENT_ID = 'emvf1ywBTUoa4N';
const url = 'http://localhost:8043/voter';
const voter = 'voter97';

console.log('Url: ', url);
console.log('Event: ', DEFAULT_EVENT_ID);
console.log('Voter: ', voter);

const socket = io(url, {
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

  socket.emit('join-election', DEFAULT_EVENT_ID, voter, (joinElection) => {
    console.log('join-election', joinElection);
    const ballot = JSON.stringify([[1, 0], [1, 0, 0]]);
    console.log(ballot);
    socket.emit('vote', DEFAULT_EVENT_ID, ballot, (vote) => {
      console.log('vote', vote);
    });
  });
});

socket.on('disconnect', () => {
  console.log('disconnected');
});
