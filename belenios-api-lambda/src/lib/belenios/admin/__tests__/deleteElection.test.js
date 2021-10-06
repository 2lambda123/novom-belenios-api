import createElection from '../createElection';
import deleteElection from '../deleteElection';

describe('Tests deleteElection', () => {
  it('Should return true', async () => {
    createElection(({ payload }) => {
      deleteElection(payload, callback);
    });
  });

  it('Should return false', async () => {
    deleteElection(undefined, callback);
  });
});
