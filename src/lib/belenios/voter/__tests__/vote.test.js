import setVoters from '../../admin/setVoters';
import makeElection from '../../admin/makeElection';
import lockVoters from '../../admin/lockVoters';
import joinElection from '../joinElection';
import deleteElection from '../../admin/deleteElection';
import vote from '../vote';
import createElection from '../../admin/createElection';

describe('Tests vote', () => {
  let ELECTION_ID;
  const DEFAULT_USER_ID = 'bob';
  const DEFAULT_VOTERS = [{ id: DEFAULT_USER_ID, weight: 1 }, { id: 'bobby', weight: 3 }];
  const DEFAULT_TEMPLATE = {
    description: 'Description of the election.',
    name: 'Name of the election',
    questions: [{
      answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
    }, {
      answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
    }],
  };
  const DEFAULT_BALLOT = [[1, 0], [1, 0, 0]];
  const DEFAULT_SOCKET = {
    join: jest.fn(),
    privCred: undefined,
  };

  beforeEach((done) => {
    createElection(({ payload }) => {
      ELECTION_ID = payload;
      setVoters(ELECTION_ID, DEFAULT_VOTERS, () => {
        lockVoters(ELECTION_ID, () => {
          makeElection(ELECTION_ID, JSON.stringify(DEFAULT_TEMPLATE), () => {
            joinElection(ELECTION_ID, DEFAULT_USER_ID, DEFAULT_SOCKET, () => {
              done();
            });
          });
        });
      });
    });
  });

  afterEach((done) => {
    deleteElection(ELECTION_ID, () => {
      done();
    });
  });

  it('Should return FAILED. Missing params', (done) => {
    function callback(data) {
      try {
        expect(data).toBeDefined();
        expect(data.status).toEqual('FAILED');
        done();
      } catch (error) {
        done(error);
      }
    }
    vote(undefined, undefined, undefined, callback);
  });

  it('Should return OK. Single vote', (done) => {
    function callback(data) {
      try {
        expect(data).toBeDefined();
        expect(data.status).toEqual('OK');
        done();
      } catch (error) {
        done(error);
      }
    }
    vote(ELECTION_ID, DEFAULT_SOCKET.privCred, JSON.stringify(DEFAULT_BALLOT), callback);
  });

  it('Should return OK. Multiple votes', (done) => {
    function callback(data) {
      try {
        expect(data).toBeDefined();
        expect(data.status).toEqual('OK');
        done();
      } catch (error) {
        done(error);
      }
    }

    const ballot1 = [[1, 0], [1, 0, 0]];
    const ballot2 = [[1, 0], [0, 1, 0]];

    vote(ELECTION_ID, DEFAULT_SOCKET.privCred, JSON.stringify(ballot1), () => {
      vote(ELECTION_ID, DEFAULT_SOCKET.privCred, JSON.stringify(ballot2), callback);
    });
  });
});
