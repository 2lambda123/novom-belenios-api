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
            expiresIn: 60,
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
            expiresIn: 60,
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

  const electionLifeCycleAsync = async (adminSocket, userList, template, afterMakeElection) => {
    const createElection = await new Promise((resolve) => adminSocket.emit('create-election', (data) => resolve(data)));
    await new Promise((resolve) => adminSocket.emit('set-voters', createElection.payload, userList, (data) => resolve(data)));
    await new Promise((resolve) => adminSocket.emit('lock-voters', createElection.payload, (data) => resolve(data)));
    await new Promise((resolve) => adminSocket.emit('make-election', createElection.payload, JSON.stringify(template), (data) => resolve(data)));
    await afterMakeElection(createElection.payload);
    const closeElection = await new Promise((resolve) => adminSocket.emit('close-election', createElection.payload, (data) => resolve(data)));
    await new Promise((resolve) => adminSocket.emit('delete-election', createElection.payload, (data) => resolve(data)));
    return closeElection;
  };

  // Scenario #1 - Voting table (Only the last vote for a participant count)
  // |-------------------------------------------------------------------------|
  // | USER       | VOTE                * WEIGHT  =   EXPECTED RESULT          |
  // |-------------------------------------------------------------------------|
  // | Patrick    | [[0, 1], [0, 1, 0]] * 1       =   [[0,    1], [0, 1,   0]] |
  // | Carlo      | [[1, 0], [0, 1, 0]] * 1       =   [[1,    0], [0, 1,   0]] |
  // | Patrick    | [[1, 0], [1, 0, 0]] * 1       =   [[1,    0], [1, 0,   0]] |
  // | Gary       | [[1, 0], [0, 1, 0]] * 100     =   [[100,  0], [0, 100, 0]] |
  // | Total      |                               =   [[102,  0], [1, 101, 0]] |
  // |-------------------------------------------------------------------------|
  test('Scenario #1 - Sync vote', (done) => {
    jest.setTimeout(60000);

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
        voterSocket1.emit('vote', eventId, JSON.stringify([[0, 1], [0, 1, 0]]), () => {
          voterSocket2.emit('join-election', eventId, 'Carlo', () => {
            voterSocket2.emit('vote', eventId, JSON.stringify([[1, 0], [0, 1, 0]]), () => {
              voterSocket1.emit('vote', eventId, JSON.stringify([[1, 0], [1, 0, 0]]), () => {
                voterSocket3.emit('join-election', eventId, 'Gary', () => {
                  voterSocket3.emit('vote', eventId, JSON.stringify([[1, 0], [0, 1, 0]]), () => {
                    callBack();
                  });
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

  // Scenario #2 - Async vote - Voting table (Only the last vote for a participant count)
  // |-------------------------------------------------------------------------|
  // | USER       | VOTE                * WEIGHT  =   EXPECTED RESULT          |
  // |-------------------------------------------------------------------------|
  // | Patrick    | [[0, 1], [0, 1, 0]] * 1       =   [[0,    1], [0, 1,   0]] |
  // | Carlo      | [[1, 0], [0, 1, 0]] * 1       =   [[1,    0], [0, 1,   0]] |
  // | Patrick    | [[1, 0], [1, 0, 0]] * 1       =   [[1,    0], [1, 0,   0]] |
  // | Gary       | [[1, 0], [0, 1, 0]] * 100     =   [[100,  0], [0, 100, 0]] |
  // | Total      |                               =   [[102,  0], [1, 101, 0]] |
  // |-------------------------------------------------------------------------|
  test('Scenario #2 - Async vote', async () => {
    jest.setTimeout(60000);

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

    const votingScenario = async (eventId) => {
      const voterSocket1 = makeVoterSocket('invitationId1');
      const voterSocket2 = makeVoterSocket('invitationId2');
      const voterSocket3 = makeVoterSocket('invitationId3');

      const joinPromises = [];

      joinPromises.push(new Promise((resolve) => voterSocket1.emit('join-election', eventId, 'Patrick', (data) => resolve(data))));
      joinPromises.push(new Promise((resolve) => voterSocket2.emit('join-election', eventId, 'Carlo', (data) => resolve(data))));
      joinPromises.push(new Promise((resolve) => voterSocket3.emit('join-election', eventId, 'Gary', (data) => resolve(data))));

      await Promise.all(joinPromises);

      const votePromises = [];

      votePromises.push(new Promise((resolve) => voterSocket1.emit('vote', eventId, JSON.stringify([[1, 0], [0, 1, 0]]), (data) => resolve(data))));
      votePromises.push(new Promise((resolve) => voterSocket2.emit('vote', eventId, JSON.stringify([[1, 0], [1, 0, 0]]), (data) => resolve(data))));
      votePromises.push(new Promise((resolve) => voterSocket3.emit('vote', eventId, JSON.stringify([[1, 0], [0, 1, 0]]), (data) => resolve(data))));

      await Promise.all(votePromises);
    };

    const adminSocket = makeAdminSocket();
    const result = await electionLifeCycleAsync(adminSocket, userList, template, votingScenario);

    expect(result).toBeDefined();
    expect(result.status).toEqual('OK');
    expect(result.payload).toEqual([[102, 0], [1, 101, 0]]);
  });

  // Scenario #3 - Async vote with 100 voters - Voting table
  // |---------------------------------------------------------------------------------------|
  // | USER                    | VOTE                * WEIGHT  =   EXPECTED RESULT           |
  // |---------------------------------------------------------------------------------------|
  // | voterX,...voterX + N    | [[1, 0], [1, 0, 0]] * 1       =   [[1,    0], [1,   0, 0]]  |
  // | Total                   |                               =   [[100,  0], [100, 0, 0]]  |
  // |---------------------------------------------------------------------------------------|
  test('Scenario #3 - Async vote - 100 voters', async () => {
    jest.setTimeout(60000);

    const template = {
      description: 'Description of the election.',
      name: 'Name of the election',
      questions: [{
        answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
      }, {
        answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
      }],
    };

    const nbVoters = 100;
    const userList = [];

    for (let i = 0; i < nbVoters; i += 1) {
      userList.push({ id: `voter${i}`, weight: 1 });
    }

    const votingScenario = async (eventId) => {
      const voters = userList;
      const sockets = [];

      voters.forEach((voter, index) => {
        sockets.push(makeVoterSocket(`invitationId${index}`));
      });

      const joinPromises = [];

      sockets.forEach((socket, index) => {
        joinPromises.push(new Promise((resolve) => socket.emit('join-election', eventId, voters[index].id, (data) => resolve(data))));
      });

      await Promise.all(joinPromises);

      const votePromises = [];

      sockets.forEach((socket) => {
        votePromises.push(new Promise((resolve) => socket.emit('vote', eventId, JSON.stringify([[1, 0], [1, 0, 0]]), (data) => resolve(data))));
      });

      await Promise.all(votePromises);
    };

    const adminSocket = makeAdminSocket();
    const result = await electionLifeCycleAsync(adminSocket, userList, template, votingScenario);
    expect(result).toBeDefined();
    expect(result.status).toEqual('OK');
    expect(result.payload).toEqual([[100, 0], [100, 0, 0]]);
  });

  // Scenario #4 - Async vote with 25 voters that votes 3 times (Only the last vote count)
  // |---------------------------------------------------------------------------------------|
  // | USER                    | VOTE                * WEIGHT  =   EXPECTED RESULT           |
  // |---------------------------------------------------------------------------------------|
  // | voterX,...voterX + N    | [[1, 0], [0, 0, 1]] * 1       =   [[1,    0], [0,  0, 1]]   |
  // | voterX,...voterX + N    | [[0, 1], [0, 1, 0]] * 1       =   [[1,    0], [0,  1, 0]]   |
  // | voterX,...voterX + N    | [[1, 0], [1, 0, 0]] * 1       =   [[1,    0], [1,  0, 0]]   |
  // | Total                   |                               =   [[25,  0],  [25, 0, 0]]   |
  // |---------------------------------------------------------------------------------------|
  test('Scenario #4 - Async vote - 25 voters that votes 3 times', async () => {
    jest.setTimeout(60000);

    const template = {
      description: 'Description of the election.',
      name: 'Name of the election',
      questions: [{
        answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
      }, {
        answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
      }],
    };

    const nbVoters = 25;
    const userList = [];

    for (let i = 0; i < nbVoters; i += 1) {
      userList.push({ id: `voter${i}`, weight: 1 });
    }

    const votingScenario = async (eventId) => {
      const voters = userList;
      const sockets = [];

      voters.forEach((voter, index) => {
        sockets.push(makeVoterSocket(`invitationId${index}`));
      });

      const joinPromises = [];

      sockets.forEach((socket, index) => {
        joinPromises.push(new Promise((resolve) => socket.emit('join-election', eventId, voters[index].id, (data) => resolve(data))));
      });

      await Promise.all(joinPromises);

      const votePromises1 = [];

      sockets.forEach((socket) => {
        votePromises1.push(new Promise((resolve) => socket.emit('vote', eventId, JSON.stringify([[1, 0], [0, 0, 1]]), (data) => resolve(data))));
      });

      await Promise.all(votePromises1);

      const votePromises2 = [];

      sockets.forEach((socket) => {
        votePromises2.push(new Promise((resolve) => socket.emit('vote', eventId, JSON.stringify([[0, 1], [0, 1, 0]]), (data) => resolve(data))));
      });

      await Promise.all(votePromises2);

      const votePromises3 = [];

      sockets.forEach((socket) => {
        votePromises3.push(new Promise((resolve) => socket.emit('vote', eventId, JSON.stringify([[1, 0], [1, 0, 0]]), (data) => resolve(data))));
      });

      await Promise.all(votePromises3);
    };

    const adminSocket = makeAdminSocket();
    const result = await electionLifeCycleAsync(adminSocket, userList, template, votingScenario);
    expect(result).toBeDefined();
    expect(result.status).toEqual('OK');
    expect(result.payload).toEqual([[25, 0], [25, 0, 0]]);
  });

  // Scenario #5 - Async vote with 25 voters - Voting table
  // |---------------------------------------------------------------------------------------|
  // | USER                    | VOTE                * WEIGHT  =   EXPECTED RESULT           |
  // |---------------------------------------------------------------------------------------|
  // | voterX,...voterX + N    | [[1, 0], [1, 0, 0]] * 1       =   [[1,    0], [1,   0, 0]]  |
  // | Total                   |                               =   [[25,  0],   [25, 0, 0]]  |
  // |---------------------------------------------------------------------------------------|
  test('Scenario #5 - Async vote - 25 voters - 5 simultaneous elections', async () => {
    jest.setTimeout(60000);

    const template = {
      description: 'Description of the election.',
      name: 'Name of the election',
      questions: [{
        answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
      }, {
        answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
      }],
    };

    const nbVoters = 50;
    const userList = [];

    for (let i = 0; i < nbVoters; i += 1) {
      userList.push({ id: `voter${i}`, weight: 1 });
    }

    const votingScenario = async (eventId) => {
      const voters = userList;
      const sockets = [];

      voters.forEach((voter, index) => {
        sockets.push(makeVoterSocket(`invitationId${index}`));
      });

      const joinPromises = [];

      sockets.forEach((socket, index) => {
        joinPromises.push(new Promise((resolve) => socket.emit('join-election', eventId, voters[index].id, (data) => resolve(data))));
      });

      await Promise.all(joinPromises);

      const votePromises = [];

      sockets.forEach((socket) => {
        votePromises.push(new Promise((resolve) => socket.emit('vote', eventId, JSON.stringify([[1, 0], [1, 0, 0]]), (data) => resolve(data))));
      });

      await Promise.all(votePromises);
    };

    const electionScenario = () => {
      const socket = makeAdminSocket();
      const electionPomise = electionLifeCycleAsync(socket, userList, template, votingScenario);
      return electionPomise;
    };

    const nbElections = 5;
    const electionPromises = [];
    for (let i = 0; i < nbElections; i += 1) {
      electionPromises.push(electionScenario());
    }
    const results = await Promise.all(electionPromises);
    results.forEach((result) => {
      expect(result).toBeDefined();
      expect(result.status).toEqual('OK');
      expect(result.payload).toEqual([[25, 0], [25, 0, 0]]);
    });
  });
});
