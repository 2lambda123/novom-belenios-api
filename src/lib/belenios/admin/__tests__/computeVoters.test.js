import fs from 'fs';
import path from 'path';
import setVoters from '../setVoters';
import makeElection from '../makeElection';
import lockVoters from '../lockVoters';
import joinElection from '../../voter/joinElection';
import vote from '../../voter/vote';
import computeVoters from '../computeVoters';
import createElection from '../createElection';
import deleteElection from '../deleteElection';
import { BALLOTS_FILE_NAME, ELECTIONS_DIR } from '../../global';

describe('Tests computeVoters', () => {
  let ELECTION_ID;
  const DEFAULT_USER_ID_1 = 'bob';
  const DEFAULT_USER_ID_2 = 'boby';
  const DEFAULT_VOTERS = [
    { id: DEFAULT_USER_ID_1, weight: 1 },
    { id: DEFAULT_USER_ID_2, weight: 3 },
  ];
  const DEFAULT_TEMPLATE = {
    description: 'Description of the election.',
    name: 'Name of the election',
    questions: [{
      answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
    }, {
      answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
    }],
  };
  const DEFAULT_BALLOT = [[1, 0], [1, 0, 0]];

  beforeEach(() => {
    ELECTION_ID = createElection();
    setVoters(ELECTION_ID, JSON.stringify(DEFAULT_VOTERS));
    lockVoters(ELECTION_ID);
    makeElection(ELECTION_ID, JSON.stringify(DEFAULT_TEMPLATE));
  });

  afterEach(() => {
    deleteElection(ELECTION_ID);
  });

  it('Should return undefined. Missing params', () => {
    const result = computeVoters(undefined);
    expect(result).toBeUndefined();
  });

  it('Should return votesCount equal to 0 and votersCount equal to 0. Zero voters.', () => {
    const ballotFilePath = path.join(ELECTIONS_DIR, ELECTION_ID, BALLOTS_FILE_NAME);
    fs.appendFileSync(ballotFilePath, '');

    const { votersCount, votesCount } = computeVoters(ELECTION_ID);

    expect(votersCount).toEqual(0);
    expect(votesCount).toEqual(0);
  });

  it('Should return votesCount equal to 1 and votersCount equal to 1. One voters a weight of one.', () => {
    const ballotFilePath = path.join(ELECTIONS_DIR, ELECTION_ID, BALLOTS_FILE_NAME);

    const userCred1 = joinElection(ELECTION_ID, DEFAULT_USER_ID_1);
    const ballot1 = vote(ELECTION_ID, userCred1, JSON.stringify(DEFAULT_BALLOT));
    fs.appendFileSync(ballotFilePath, ballot1);

    const { votersCount, votesCount } = computeVoters(ELECTION_ID);

    expect(votersCount).toEqual(1);
    expect(votesCount).toEqual(1);
  });

  it('Should return votesCount equal to 4 and votersCount equal to 2. Multiple voters with different weight.', () => {
    const ballotFilePath = path.join(ELECTIONS_DIR, ELECTION_ID, BALLOTS_FILE_NAME);

    const userCred1 = joinElection(ELECTION_ID, DEFAULT_USER_ID_1);
    const userCred2 = joinElection(ELECTION_ID, DEFAULT_USER_ID_2);
    const ballot1 = vote(ELECTION_ID, userCred1, JSON.stringify(DEFAULT_BALLOT));
    const ballot2 = vote(ELECTION_ID, userCred2, JSON.stringify(DEFAULT_BALLOT));

    fs.appendFileSync(ballotFilePath, [ballot1, ballot2].map((b) => b).join(''));

    const { votersCount, votesCount } = computeVoters(ELECTION_ID);

    expect(votersCount).toEqual(2);
    expect(votesCount).toEqual(4);
  });
});
