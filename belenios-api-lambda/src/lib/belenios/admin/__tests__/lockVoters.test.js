import setVoters from '../setVoters';
import lockVoters from '../lockVoters';
import deleteElection from '../deleteElection';
import createElection from '../createElection';

describe('Tests lockVoters', () => {
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
      lockVoters('Invalid id', callback);
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
      lockVoters(undefined, callback);
    });

    it('Should return OK.', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('OK');
          done();
        } catch (error) {
          done(error);
        }
      }
      lockVoters(ELECTION_ID, callback);
    });
  });
});
