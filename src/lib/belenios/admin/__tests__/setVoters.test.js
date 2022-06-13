import setVoters from '../setVoters';
import createElection from '../createElection';
import deleteElection from '../deleteElection';

const DEFAULT_VOTERS = [{ id: 'bob', weight: 1 }, { id: 'bobby', weight: 3 }];

describe('Tests setVoters', () => {
  describe('Election not created yet.', () => {
    it('Should return false. Invalid id', () => {
      const res = setVoters('Invalid id', DEFAULT_VOTERS);
      expect(res).toBeFalsy();
    });
  });
  describe('Election created.', () => {
    let ELECTION_ID;

    beforeEach(() => {
      ELECTION_ID = createElection();
    });

    afterEach(() => {
      deleteElection(ELECTION_ID);
    });

    it('Should return false. No election id', () => {
      const res = setVoters(undefined, DEFAULT_VOTERS);
      expect(res).toBeFalsy();
    });

    it('Should return false. No voters id', () => {
      const res = setVoters(ELECTION_ID, undefined);
      expect(res).toBeFalsy();
    });

    it('Should return true', () => {
      const res = setVoters(ELECTION_ID, DEFAULT_VOTERS);
      expect(res).toBeTruthy();
    });
  });
});
