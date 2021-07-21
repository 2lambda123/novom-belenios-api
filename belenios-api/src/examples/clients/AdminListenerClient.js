//--------------------------------------------------------------------------------
// AdminCLient
// Example of an admin client that output election progression.
//--------------------------------------------------------------------------------

/* eslint-disable no-console */
import io from 'socket.io-client';
import jsonwebtoken from 'jsonwebtoken';

const DEFAULT_EVENT_ID = 'P2N684xYV1CQ2j';
const url = 'http://localhost:8043/admin';

console.log('Admin Listener Client');
console.log('Url: ', url);
console.log('Event: ', DEFAULT_EVENT_ID);

const socket = io(url, {
  rejectUnauthorized: false,
  auth: {
    authToken: jsonwebtoken.sign(
      { extraPayload: { accessScope: { event: { action: ['edit'] } } } },
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
    socket.emit('compute-voters', DEFAULT_EVENT_ID, (computeVoters) => {
      console.log('compute-voters', computeVoters);
    });
    socket.emit('get-voters-count', DEFAULT_EVENT_ID, (getActiveVoters) => {
      console.log('get-voters-count', getActiveVoters);
    });
  }, 2000);

  setInterval(() => {
    socket.emit('refreshAuthToken', jsonwebtoken.sign(
      { extraPayload: { accessScope: { event: { action: ['edit'] } } } },
      process.env.JWT_SECRET,
      {
        algorithm: process.env.JWT_ALGO,
        expiresIn: 15,
      },
    ), ({ status }) => { console.log(status); });
  }, 8000);
});

socket.on('disconnect', () => {
  console.log('disconnected');
});
