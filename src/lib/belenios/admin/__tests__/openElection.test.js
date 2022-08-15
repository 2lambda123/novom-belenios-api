import deleteElection from '../deleteElection';
import openElection from '../openElection';

describe('Tests createElection', () => {
  const DEFAULT_VOTERS = [{ id: 'bob', weight: 1 }, { id: 'bobby', weight: 3 }];
  const DEFAULT_TEMPLATE = {
    description: 'Description of the election.',
    name: 'Name of the election',
    questions: [{
      answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
    }, {
      answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
    }],
  };

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
    deleteElection(electionId);
    expect(electionId).toBeDefined();
  });

  it('Should return an election id. Election with no description', () => {
    const election1 = {
      name: 'Name of the election',
      questions: [{
        answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
      }, {
        answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
      }],
    };
    const election2 = {
      description: null,
      name: 'Name of the election',
      questions: [{
        answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
      }, {
        answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
      }],
    };
    const election3 = {
      description: { fr: undefined, en: undefined },
      name: 'Name of the election',
      questions: [{
        answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
      }, {
        answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
      }],
    };
    const election4 = {
      name: 'Name of the election',
      description: '',
      questions: [{
        answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
      }, {
        answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
      }],
    };

    const electionId1 = openElection(DEFAULT_VOTERS, election1);
    deleteElection(electionId1);

    const electionId2 = openElection(DEFAULT_VOTERS, election2);
    deleteElection(electionId2);

    const electionId3 = openElection(DEFAULT_VOTERS, election3);
    deleteElection(electionId3);

    const electionId4 = openElection(DEFAULT_VOTERS, election4);
    deleteElection(electionId4);

    expect(electionId1).toBeDefined();
    expect(electionId2).toBeDefined();
    expect(electionId3).toBeDefined();
    expect(electionId4).toBeDefined();
  });
});
