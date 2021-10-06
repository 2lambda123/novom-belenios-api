import setVoters from '../setVoters';
import lockVoters from '../lockVoters';
import deleteElection from '../deleteElection';
import createElection from '../createElection';

describe('Tests lockVoters', () => {
  describe('Election not created yet.', () => {
    it('Should return FAILED.', () => {
      const res = setVoters('Invalid id');
      expect(res).toBeFalsy();
    });
  });
  describe('Election created.', () => {
    let ELECTION_ID;

    beforeEach(() => {
      ELECTION_ID = createElection();
      setVoters(ELECTION_ID);
    });

    afterEach(() => {
      deleteElection(ELECTION_ID);
    });

    it('Should return true.', () => {
      const res = lockVoters(ELECTION_ID);
      expect(res).toBeTruthy();
    });
  });
});
