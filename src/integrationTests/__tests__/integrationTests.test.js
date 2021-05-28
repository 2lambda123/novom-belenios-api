import io from 'socket.io-client';
import jsonwebtoken from 'jsonwebtoken';
import { exec } from 'child_process';
import killProcess from '../helpers/killProcesss';

describe('Integration test', () => {
  const port = 3000;

  let serverProcess;
  let adminSockets;
  let voterSockets;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'hii';
    process.env.JWT_ALGO = 'HS256';
    adminSockets = [];
    voterSockets = [];
    serverProcess = exec('yarn start:integrationTestServer', (error) => {
      if (error.code) console.error(error); // eslint-disable-line no-console
    });
  });

  afterEach(async () => {
    process.env.JWT_SECRET = undefined;
    process.env.JWT_ALGO = undefined;
    adminSockets.forEach((e) => e.disconnect());
    voterSockets.forEach((e) => e.disconnect());
    await killProcess(serverProcess);
  });

  const makeAdminSocket = () => {
    const socket = io(`http://localhost:${port}/admin`, {
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
    adminSockets.push(socket);
    return socket;
  };

  const makeVoterSocket = (ticketId) => {
    const socket = io(`http://localhost:${port}/voter`, {
      auth: {
        authToken: jsonwebtoken.sign(
          { extraPayload: { ticketId } },
          process.env.JWT_SECRET,
          {
            algorithm: process.env.JWT_ALGO,
            expiresIn: 10,
          },
        ),
      },
    });
    voterSockets.push(socket);
    return socket;
  };

  const electionLifeCycle = (adminSocket, userList, template, afterMakeElection, callBack) => {
    adminSocket.emit('create-election', (createElection) => {
      adminSocket.emit('set-voters', createElection.payload, userList, () => {
        adminSocket.emit('lock-voters', createElection.payload, () => {
          adminSocket.emit('make-election', createElection.payload, JSON.stringify(template), () => {
            afterMakeElection(createElection.payload, () => {
              adminSocket.emit('close-election', createElection.payload, (closeElection) => {
                adminSocket.emit('delete-election', createElection.payload, () => {
                  callBack(closeElection);
                });
              });
            });
          });
        });
      });
    });
  };

  // Scenario #1 - Voting table
  // |-------------------------------------------------------------------------|
  // | USER       | VOTE                * WEIGHT  =   EXPECTED RESULT          |
  // |-------------------------------------------------------------------------|
  // | Patrick    | [[1, 0], [1, 0, 0]] * 1       =   [[1,    0], [1, 0,   0]] |
  // | Carlo      | [[1, 0], [1, 0, 0]] * 1       =   [[1,    0], [0, 1,   0]] |
  // | Gary       | [[1, 0], [1, 0, 0]] * 100     =   [[100,  0], [0, 100, 0]] |
  // | Total      |                               =   [[102,  0], [1, 101, 0]] |
  // |-------------------------------------------------------------------------|
  test('Scenario #1', (done) => {
    jest.setTimeout(30000);

    const template = {
      description: 'Description of the election.',
      name: 'Name of the election',
      questions: [{
        answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
      }, {
        answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
      }],
    };

    const userList = [
      { id: 'Bob', weight: 0 },
      { id: 'Patrick', weight: 1 },
      { id: 'Sandy', weight: 1 },
      { id: 'Karen', weight: 1 },
      { id: 'Puff', weight: 1 },
      { id: 'Pearl', weight: 1 },
      { id: 'Carlo', weight: 1 },
      { id: 'Plankton', weight: 10 },
      { id: 'Krabs', weight: 10 },
      { id: 'Gary', weight: 100 },
    ];

    const votingScenario = (eventId, callBack) => {
      const voterSocket1 = makeVoterSocket('invitationId1');
      const voterSocket2 = makeVoterSocket('invitationId2');
      const voterSocket3 = makeVoterSocket('invitationId3');

      voterSocket1.emit('join-election', eventId, 'Patrick', () => {
        voterSocket1.emit('vote', eventId, JSON.stringify([[1, 0], [1, 0, 0]]), () => {
          voterSocket2.emit('join-election', eventId, 'Carlo', () => {
            voterSocket2.emit('vote', eventId, JSON.stringify([[1, 0], [0, 1, 0]]), () => {
              voterSocket3.emit('join-election', eventId, 'Gary', () => {
                voterSocket3.emit('vote', eventId, JSON.stringify([[1, 0], [0, 1, 0]]), () => {
                  callBack();
                });
              });
            });
          });
        });
      });
    };

    const adminSocket = makeAdminSocket();

    function callback(electionResult) {
      try {
        expect(electionResult).toBeDefined();
        expect(electionResult.status).toEqual('OK');
        expect(electionResult.payload).toEqual([[102, 0], [1, 101, 0]]);
        done();
      } catch (error) {
        done(error);
      }
    }

    electionLifeCycle(adminSocket, userList, template, votingScenario, callback);
  });

  test('Scenario #2', (done) => {
    // TODO: Asyc vote
    done();
  });

  test('Scenario #3', (done) => {
    // TODO: Load test
    done();
  });
});
