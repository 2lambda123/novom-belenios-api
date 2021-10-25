import setVoters from '../../admin/setVoters';
import lockVoters from '../../admin/lockVoters';
import joinElection from '../joinElection';
import deleteElection from '../../admin/deleteElection';
import createElection from '../../admin/createElection';
import makeElection from '../../admin/makeElection';

describe('Tests joinElection', () => {
  let ELECTION_ID;
  const DEFAULT_USER_ID = 'bob';
  const DEFAULT_VOTERS = [{ id: DEFAULT_USER_ID, weight: 1 }, { id: 'bobby', weight: 3 }];
  const DEFAULT_TEMPLATE = {
    description: 'Description of the election.',
    name: 'Name of the election',
    questions: [{
      answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
    }, {
      answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
    }],
  };
  describe('Election not created yet.', () => {
    it('Should return FAILED.', () => {
      const privCred = joinElection(ELECTION_ID, DEFAULT_USER_ID);
      expect(privCred).toBeUndefined();
    });
  });
  describe('Election created.', () => {
    beforeEach(() => {
      ELECTION_ID = createElection();
      setVoters(ELECTION_ID, JSON.stringify(DEFAULT_VOTERS));
      lockVoters(ELECTION_ID);
      makeElection(ELECTION_ID, JSON.stringify(DEFAULT_TEMPLATE));
    });

    afterEach(() => {
      deleteElection(ELECTION_ID);
    });

    it('Should return FAILED. Undefined params', () => {
      const privCred = joinElection(undefined, undefined);
      expect(privCred).toBeUndefined();
    });
    it('Should return a privCred', () => {
      const privCred = joinElection(ELECTION_ID, DEFAULT_USER_ID);
      expect(privCred).toBeDefined();
    });
  });
});
