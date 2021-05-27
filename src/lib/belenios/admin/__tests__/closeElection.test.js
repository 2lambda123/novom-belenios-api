import setVoters from '../setVoters';
import makeElection from '../makeElection';
import lockVoters from '../lockVoters';
import joinElection from '../../voter/joinElection';
import vote from '../../voter/vote';
import closeElection from '../closeElection';
import deleteElection from '../deleteElection';
import createElection from '../createElection';

describe('Tests closeElection', () => {
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
              vote(ELECTION_ID, DEFAULT_SOCKET.privCred, JSON.stringify(DEFAULT_BALLOT),
                () => {
                  done();
                });
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
        console.log(data);
        expect(data).toBeDefined();
        expect(data.status).toEqual('FAILED');
        done();
      } catch (error) {
        done(error);
      }
    }
    closeElection(undefined, callback);
  });

  it('Should return OK and result should be valid', (done) => {
    function callback(data) {
      try {
        console.log(data);
        expect(data).toBeDefined();
        expect(data.status).toEqual('OK');
        expect(data.payload).toEqual([[1, 0], [1, 0, 0]]);
        done();
      } catch (error) {
        done(error);
      }
    }
    closeElection(ELECTION_ID, callback);
  });
});
