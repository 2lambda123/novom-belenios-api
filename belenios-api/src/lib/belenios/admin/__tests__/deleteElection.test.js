import createElection from '../createElection';
import deleteElection from '../deleteElection';

describe('Tests deleteElection', () => {
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

    createElection(({ payload }) => {
      deleteElection(payload, callback);
    });
  });

  it('Should return FAILED. Conference does not exist', (done) => {
    function callback(data) {
      try {
        expect(data).toBeDefined();
        expect(data.status).toEqual('FAILED');
        done();
      } catch (error) {
        done(error);
      }
    }

    deleteElection(undefined, callback);
  });
});
