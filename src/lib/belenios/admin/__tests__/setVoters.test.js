import setVoters from '../setVoters';
import createElection from '../createElection';
import deleteElection from '../deleteElection';

const DEFAULT_VOTERS = [{ id: 'bob', weight: 1 }, { id: 'bobby', weight: 3 }];

describe('Tests setVoters', () => {
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
      setVoters('Invalid id', DEFAULT_VOTERS, callback);
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

    it('Should return FAILED. No election id', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('FAILED');
          done();
        } catch (error) {
          done(error);
        }
      }
      setVoters(undefined, DEFAULT_VOTERS, callback);
    });

    it('Should return FAILED. No voters id', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('FAILED');
          done();
        } catch (error) {
          done(error);
        }
      }
      setVoters(ELECTION_ID, undefined, callback);
    });

    it('Should return OK', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('OK');
          done();
        } catch (error) {
          done(error);
        }
      }
      setVoters(ELECTION_ID, DEFAULT_VOTERS, callback);
    });
  });
});
