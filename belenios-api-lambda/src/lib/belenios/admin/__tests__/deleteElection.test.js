import createElection from '../createElection';
import deleteElection from '../deleteElection';

describe('Tests deleteElection', () => {
  it('Should return true', async () => {
    const electionId = createElection();
    const result = deleteElection(electionId);
    expect(result).toBeTruthy();
  });

  it('Should return false', async () => {
    const result = deleteElection(undefined);
    expect(result).toBeFalsy();
  });
});
