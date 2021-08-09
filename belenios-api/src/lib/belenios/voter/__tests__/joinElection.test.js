import setVoters from '../../admin/setVoters';
import lockVoters from '../../admin/lockVoters';
import joinElection from '../joinElection';
import deleteElection from '../../admin/deleteElection';
import createElection from '../../admin/createElection';
import makeElection from '../../admin/makeElection';

let ELECTION_ID;
const DEFAULT_USER_ID = 'bob';
const DEFAULT_VOTERS = [{ id: DEFAULT_USER_ID, weight: 1 }, { id: 'bobby', weight: 3 }];
const DEFAULT_SOCKET = { join: jest.fn() };
const DEFAULT_TEMPLATE = {
  description: 'Description of the election.',
  name: 'Name of the election',
  questions: [{
    answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
  }, {
    answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
  }],
};

describe('Tests joinElection', () => {
  describe('Election not created yet.', () => {
    it('Should return FAILED.', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('FAILED');
          done();
        } catch (error) {
          done(error);
        }
      }
      joinElection('Invalid id', DEFAULT_USER_ID, DEFAULT_SOCKET, callback);
    });
  });
  describe('Election created.', () => {
    beforeEach((done) => {
      createElection(({ payload }) => {
        ELECTION_ID = payload;
        setVoters(ELECTION_ID, DEFAULT_VOTERS, () => {
          lockVoters(ELECTION_ID, () => {
            makeElection(ELECTION_ID, JSON.stringify(DEFAULT_TEMPLATE), () => {
              done();
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

    it('Should return FAILED. Undefined params', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('FAILED');
          done();
        } catch (error) {
          done(error);
        }
      }
      joinElection(undefined, undefined, undefined, callback);
    });
    it('Should return OK and call socket.join', (done) => {
      const join = jest.fn();
      const socket = { join };

      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('OK');
          expect(join).toBeCalledTimes(1);
          done();
        } catch (error) {
          done(error);
        }
      }
      joinElection(ELECTION_ID, DEFAULT_USER_ID, socket, callback);
    });
    it('Should return OK and add userCred to socket', (done) => {
      const join = jest.fn();
      const socket = { join };

      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('OK');
          expect(socket.privCred).toBeDefined();
          done();
        } catch (error) {
          done(error);
        }
      }
      joinElection(ELECTION_ID, DEFAULT_USER_ID, socket, callback);
    });
  });
});
