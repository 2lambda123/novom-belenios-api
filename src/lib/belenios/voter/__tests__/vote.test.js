import setVoters from '../../admin/setVoters';
import makeElection from '../../admin/makeElection';
import lockVoters from '../../admin/lockVoters';
import joinElection from '../joinElection';
import deleteElection from '../../admin/deleteElection';
import vote from '../vote';
import createElection from '../../admin/createElection';

describe('Tests vote', () => {
  let ELECTION_ID;
  const DEFAULT_USER_ID = 'bob';
  const DEFAULT_BALLOT = [[1, 0], [1, 0, 0]];
  const DEFAULT_VOTERS = [{ id: DEFAULT_USER_ID, weight: 1 }, { id: 'bobby', weight: 3 }];
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

  it('Should return undefined. Missing params', () => {
    const ballot = vote(undefined, undefined, undefined);
    expect(ballot).toBeUndefined();
  });

  it('Should return a ballot. Single vote', async () => {
    const privCred = joinElection(ELECTION_ID, DEFAULT_USER_ID);
    const ballot = vote(ELECTION_ID, privCred, DEFAULT_BALLOT);
    expect(ballot).toBeDefined();
  });

  it('Should return a valid ballot. Multiple votes', () => {
    const ballot1 = [[1, 0], [1, 0, 0]];
    const ballot2 = [[1, 0], [0, 1, 0]];

    const privCred1 = joinElection(ELECTION_ID, DEFAULT_USER_ID);
    const vote1 = vote(ELECTION_ID, privCred1, ballot1);

    const privCred2 = joinElection(ELECTION_ID, DEFAULT_USER_ID);
    const vote2 = vote(ELECTION_ID, privCred2, ballot2);

    expect(vote1).toBeDefined();
    expect(vote2).toBeDefined();
  });
});
