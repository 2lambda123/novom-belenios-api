import createElection from '../createElection';
import deleteElection from '../deleteElection';

describe('Tests createElection', () => {
  it('Should return an election id', (done) => {
    function callback(data) {
      try {
        expect(data).toBeDefined();
        expect(data.status).toEqual('OK');
        expect(data.payload).toBeDefined();
        deleteElection(data.payload, () => {
          done();
        });
        done();
      } catch (error) {
        done(error);
      }
    }
    createElection(callback);
  });
});
