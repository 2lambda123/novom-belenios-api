import createElection from '../../belenios/admin/createElection';
import deleteElection from '../../belenios/admin/deleteElection';
import lockVoters from '../../belenios/admin/lockVoters';
import makeElection from '../../belenios/admin/makeElection';
import setVoters from '../../belenios/admin/setVoters';
import { PRIVATE_CREDENTIALS_FILE_NAME, PUBLIC_CREDENTIALS_FILE_NAME, VOTERS_FILE_NAME } from '../../belenios/global';
import electionFilesToObject from '../electionFilesToObject';
import electionObjectToFiles from '../electionObjectToFiles';

describe('Test election files to object', () => {
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

  beforeEach(() => {
    ELECTION_ID = createElection();
    setVoters(ELECTION_ID, DEFAULT_VOTERS);
    lockVoters(ELECTION_ID);
    makeElection(ELECTION_ID, DEFAULT_TEMPLATE);
  });

  afterEach(() => {
    deleteElection(ELECTION_ID);
  });

  it('Object to files', async () => {
    const election = electionFilesToObject(ELECTION_ID);
    const votersFile = {
      file: election.users.map(({ voter }) => voter).join('\n'),
      name: VOTERS_FILE_NAME,
    };
    const privateCredentialsFile = {
      file: election.users.map(({ privateCred }) => privateCred).join('\n'),
      name: PRIVATE_CREDENTIALS_FILE_NAME,
    };
    const publicCredentialsFile = {
      file: election.users.map(({ publicCred }) => publicCred).join('\n'),
      name: PUBLIC_CREDENTIALS_FILE_NAME,
    };
    deleteElection(ELECTION_ID);
    electionObjectToFiles(ELECTION_ID, [
      ...election.files,
      votersFile,
      privateCredentialsFile,
      publicCredentialsFile,
    ]);
    const election2 = electionFilesToObject(ELECTION_ID);
    expect(election.files).toEqual(election2.files);
    expect(election.users).toEqual(election2.users);
  });
});
