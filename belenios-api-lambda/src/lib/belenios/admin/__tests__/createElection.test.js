import createElection from '../createElection';

describe('Tests createElection', () => {
  it('Should return an election id', () => {
    const electionId = createElection();
    expect(electionId).toBeDefined();
  });
});
