import verifyVoters from '../verifyVoters';
import setVoters from '../setVoters';
import createElection from '../createElection';
import deleteElection from '../deleteElection';

describe('Tests verifyVoters', () => {
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
      verifyVoters('Invalid id', callback);
    });
  });
  describe('Election created.', () => {
    let ELECTION_ID;
    const DEFAULT_VOTERS = [{ id: 'bob', weight: 1 }, { id: 'bobby', weight: 3 }];

    beforeEach((done) => {
      createElection(({ payload }) => {
        ELECTION_ID = payload;
        setVoters(ELECTION_ID, DEFAULT_VOTERS, () => {
          done();
        });
      });
    });

    afterEach((done) => {
      deleteElection(ELECTION_ID, () => {
        done();
      });
    });

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
      verifyVoters(undefined, callback);
    });

    it('Should return OK and a payload of voters', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('OK');
          expect(data.payload).toEqual(DEFAULT_VOTERS);
          done();
        } catch (error) {
          done(error);
        }
      }
      verifyVoters(ELECTION_ID, callback);
    });
  });
});
