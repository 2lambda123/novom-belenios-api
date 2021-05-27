import rimfaf from 'rimraf';
import path from 'path';
import { ELECTIONS_DIR } from '../../global';
import setVoters from '../setVoters';
import makeElection from '../makeElection';
import lockVoters from '../lockVoters';
import joinElection from '../../voter/joinElection';
import vote from '../../voter/vote';
import computeVoters from '../computeVoters';
import createElection from '../createElection';

describe('Tests computeVoters', () => {
  let ELECTION_ID;
  const DEFAULT_USER_ID_1 = 'bob';
  const DEFAULT_VOTERS = [
    { id: DEFAULT_USER_ID_1, weight: 1 },
    { id: 'bobby', weight: 3 },
  ];
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
    const ballot = JSON.stringify(DEFAULT_BALLOT);
    createElection(({ payload }) => {
      ELECTION_ID = payload;
      setVoters(ELECTION_ID, DEFAULT_VOTERS, () => {
        lockVoters(ELECTION_ID, () => {
          makeElection(ELECTION_ID, JSON.stringify(DEFAULT_TEMPLATE), () => {
            joinElection(ELECTION_ID, DEFAULT_USER_ID_1, DEFAULT_SOCKET, () => {
              vote(ELECTION_ID, DEFAULT_SOCKET.privCred, ballot, () => {
                done();
              });
            });
          });
        });
      });
    });
  });

  afterEach(() => {
    const electionPath = path.join(ELECTIONS_DIR, ELECTION_ID);
    rimfaf.sync(electionPath);
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
    computeVoters(undefined, callback);
  });

  it('Should return OK and number of voters equal to 1', (done) => {
    function callback(data) {
      try {
        expect(data).toBeDefined();
        expect(data.status).toEqual('OK');
        expect(data.payload).toEqual({ nbVoters: 1, nbVotes: 1 });
        done();
      } catch (error) {
        done(error);
      }
    }
    computeVoters(ELECTION_ID, callback);
  });
});
