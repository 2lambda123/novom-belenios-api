import setVoters from '../setVoters';
import makeElection from '../makeElection';
import lockVoters from '../lockVoters';
import deleteElection from '../deleteElection';
import createElection from '../createElection';

const DEFAULT_TEMPLATE = {
  description: 'Description of the election.',
  name: 'Name of the election',
  questions: [{
    answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
  }, {
    answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
  }],
};

describe('Tests makeElection', () => {
  describe('Election not created yet.', () => {
    it('Should return FAILED.', () => {
      const res = makeElection('Invalid id', DEFAULT_TEMPLATE);
      expect(res).toBeFalsy();
    });
  });
  describe('Election created.', () => {
    let ELECTION_ID;
    const DEFAULT_VOTERS = [{ id: 'bob', weight: 1 }, { id: 'bobby', weight: 3 }];

    beforeEach(() => {
      ELECTION_ID = createElection();
      setVoters(ELECTION_ID, DEFAULT_VOTERS);
      lockVoters(ELECTION_ID);
    });

    afterEach(() => {
      deleteElection(ELECTION_ID);
    });

    it('Should return FAILED. No election id', () => {
      const res = makeElection(undefined, DEFAULT_TEMPLATE);
      expect(res).toBeFalsy();
    });
    it('Should return OK', () => {
      const res = makeElection(ELECTION_ID, DEFAULT_TEMPLATE);
      expect(res).toBeTruthy();
    });
  });
});
