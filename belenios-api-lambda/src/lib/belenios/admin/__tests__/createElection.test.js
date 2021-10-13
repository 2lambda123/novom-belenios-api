import createElection from '../createElection';
import deleteElection from '../deleteElection';

describe('Tests createElection', () => {
  it('Should return an election id', async () => {
    const electionId = createElection();
    deleteElection(electionId);
    expect(electionId).toBeDefined();
  });
});
