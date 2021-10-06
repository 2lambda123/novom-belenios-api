import deleteElection from '../deleteElection';
import openElection from '../openElection';

describe('Tests createElection', () => {
  const DEFAULT_VOTERS = JSON.stringify([{ id: 'bob', weight: 1 }, { id: 'bobby', weight: 3 }]);
  const DEFAULT_TEMPLATE = JSON.stringify({
    description: 'Description of the election.',
    name: 'Name of the election',
    questions: [{
      answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
    }, {
      answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
    }],
  });

  it('Should return false. Invalid votersList', () => {
    const electionId = openElection(undefined, DEFAULT_TEMPLATE);
    deleteElection(electionId);
    expect(electionId).toBeUndefined();
  });
  it('Should return false. Invalid template', () => {
    const electionId = openElection(DEFAULT_VOTERS, undefined);
    deleteElection(electionId);
    expect(electionId).toBeUndefined();
  });
  it('Should return an election id', () => {
    const electionId = openElection(DEFAULT_VOTERS, DEFAULT_TEMPLATE);
    // deleteElection(electionId);
    expect(electionId).toBeDefined();
  });
});
