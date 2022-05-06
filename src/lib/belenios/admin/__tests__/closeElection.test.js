import setVoters from '../setVoters';
import makeElection from '../makeElection';
import lockVoters from '../lockVoters';
import closeElection from '../closeElection';
import deleteElection from '../deleteElection';
import createElection from '../createElection';

describe('Tests closeElection', () => {
  let ELECTION_ID;
  const DEFAULT_VOTERS = [{ id: 'bob', weight: 1 }, { id: 'bobby', weight: 3 }];
  const DEFAULT_TEMPLATE = {
    description: 'Description of the election.',
    name: 'Name of the election',
    questions: [{
      answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
    }, {
      answers: ['Answer 1', 'Answer 2', 'Answer 3'], blank: true, min: 1, max: 1, question: 'Question 2?',
    }],
  };

  beforeEach(() => {
    ELECTION_ID = createElection();
    setVoters(ELECTION_ID, DEFAULT_VOTERS);
    lockVoters(ELECTION_ID);
    makeElection(ELECTION_ID, DEFAULT_TEMPLATE);
  });

  afterEach(() => {
    deleteElection(ELECTION_ID);
  });

  it('Should return undefined. Invalid election id.', () => {
    const result = closeElection(undefined);
    expect(result).toBeUndefined();
  });

  it('Should return valid result.', () => {
    const result = closeElection(ELECTION_ID);
    expect(result).toEqual([[0, 0], [0, 0, 0]]);
  });
});
