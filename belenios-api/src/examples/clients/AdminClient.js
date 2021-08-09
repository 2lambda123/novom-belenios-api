//--------------------------------------------------------------------------------
// AdminCLient
// Example of an admin client that create an election.
//--------------------------------------------------------------------------------

/* eslint-disable no-console */
import io from 'socket.io-client';
import jsonwebtoken from 'jsonwebtoken';

const template = {
  description: 'Description of the election.',
  name: 'Name of the election',
  questions: [{
    answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
  }, {
    answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
  }],
};

const url = 'http://localhost:8043/admin';
const votersList = [];
const nbVoters = 300;

for (let i = 0; i < nbVoters; i += 1) {
  votersList.push({ id: `voter${i}`, weight: 1 });
}

console.log('Admin Client');
console.log('Url: ', url);

const socket = io(url, {
  rejectUnauthorized: false,
  auth: {
    authToken: jsonwebtoken.sign(
      { extraPayload: { accessScope: { event: { action: ['edit'] } } } },
      process.env.JWT_SECRET,
      {
        algorithm: process.env.JWT_ALGO,
        expiresIn: 30,
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
  socket.emit('create-election', (createElection) => {
    console.log('create-election', createElection);
    socket.emit('set-voters', createElection.payload, votersList, (setVoters) => {
      console.log('set-voters', setVoters);
      socket.emit('verify-voters', createElection.payload, (verifyVoters) => {
        console.log('verify-voters', verifyVoters);
        socket.emit('lock-voters', createElection.payload, (lockVoters) => {
          console.log('lock-voters', lockVoters);
          socket.emit('make-election', createElection.payload, JSON.stringify(template), (makeElection) => {
            console.log('make-election', makeElection);
          });
        });
      });
    });
  });

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
