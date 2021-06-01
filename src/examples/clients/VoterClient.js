import io from 'socket.io-client';
import jsonwebtoken from 'jsonwebtoken';

const DEFAULT_EVENT_ID = 'cYd2gj4iqkP8Py';

const socket = io('http://localhost:3000/voter', {
  auth: {
    authToken: jsonwebtoken.sign(
      { extraPayload: { ticketId: 'invitationId' } },
      process.env.JWT_SECRET,
      {
        algorithm: process.env.JWT_ALGO,
        expiresIn: 10,
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
        expiresIn: 10,
      },
    ), ({ status }) => { console.log(status); });
  }, 8000);

  socket.emit('join-election', DEFAULT_EVENT_ID, 'bob', (joinElection) => {
    console.log(joinElection);
    const ballot = JSON.stringify([[1, 0], [1, 0, 0]]);
    socket.emit('vote', DEFAULT_EVENT_ID, ballot, (vote) => {
      console.log(vote);
    });
  });
});

socket.on('disconnect', () => {
  console.log('disconnected');
});
