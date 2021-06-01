import io from 'socket.io-client';
import jsonwebtoken from 'jsonwebtoken';

const DEFAULT_EVENT_ID = 'cYd2gj4iqkP8Py';

const socket = io('http://localhost:3000/admin', {
  auth: {
    authToken: jsonwebtoken.sign(
      { extraPayload: { accessScope: { event: { action: ['edit'] } } } },
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
  socket.emit('subscribe-election', DEFAULT_EVENT_ID, (joinElection) => {
    console.log('subscribe-election', joinElection);
    setInterval(() => {
      socket.emit('compute-voters', DEFAULT_EVENT_ID, (computeVoters) => {
        console.log('compute-voters', computeVoters);
      });
    }, 8000);
  });

  socket.on('voters-count-update', (voterCount) => {
    console.log('subscribe-election', voterCount);
  });

  setInterval(() => {
    socket.emit('refreshAuthToken', jsonwebtoken.sign(
      { extraPayload: { accessScope: { event: { action: ['edit'] } } } },
      process.env.JWT_SECRET,
      {
        algorithm: process.env.JWT_ALGO,
        expiresIn: 10,
      },
    ), ({ status }) => { console.log(status); });
  }, 8000);
});

socket.on('disconnect', () => {
  console.log('disconnected');
});
