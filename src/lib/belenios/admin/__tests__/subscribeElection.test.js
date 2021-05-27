import subscribeElection from '../subscribeElection';
import deleteElection from '../deleteElection';
import createElection from '../createElection';

const DEFAULT_SOCKET = { join: jest.fn() };

describe('Tests subscribeElection', () => {
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
      subscribeElection('Invalid id', DEFAULT_SOCKET, callback);
    });
  });
  describe('Election created.', () => {
    let ELECTION_ID;

    beforeEach((done) => {
      createElection(({ payload }) => {
        ELECTION_ID = payload;
        done();
      });
    });

    afterEach((done) => {
      deleteElection(ELECTION_ID, () => {
        done();
      });
    });

    it('Should return FAILED. Undefined socket', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('FAILED');
          done();
        } catch (error) {
          done(error);
        }
      }
      subscribeElection(ELECTION_ID, undefined, callback);
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
      subscribeElection(ELECTION_ID, socket, callback);
    });
  });
});
