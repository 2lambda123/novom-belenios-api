import createElection from '../../belenios/admin/createElection';
import deleteElection from '../../belenios/admin/deleteElection';
import lockVoters from '../../belenios/admin/lockVoters';
import makeElection from '../../belenios/admin/makeElection';
import setVoters from '../../belenios/admin/setVoters';
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

  beforeEach((done) => {
    createElection(({ payload }) => {
      ELECTION_ID = payload;
      setVoters(ELECTION_ID, DEFAULT_VOTERS, () => {
        lockVoters(ELECTION_ID, () => {
          makeElection(ELECTION_ID, JSON.stringify(DEFAULT_TEMPLATE), () => {
            done();
          });
        });
      });
    });
  });

  afterEach((done) => {
    deleteElection(ELECTION_ID, () => {
      done();
    });
  });

  it('Object to files', async () => {
    const election = electionFilesToObject(ELECTION_ID);

    await new Promise((resolve) => {
      deleteElection(ELECTION_ID, () => {
        resolve();
      });
    });

    electionObjectToFiles(ELECTION_ID, election);

    const election2 = electionFilesToObject(ELECTION_ID);

    expect(election === election2);
  });
});
