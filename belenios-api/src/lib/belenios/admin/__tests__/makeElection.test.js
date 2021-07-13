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
    it('Should return FAILED.', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('FAILED');
          done();
        } catch (error) {
          done(error);
        }
      }
      makeElection('Invalid id', JSON.stringify(DEFAULT_TEMPLATE), callback);
    });
  });
  describe('Election created.', () => {
    let ELECTION_ID;
    const DEFAULT_VOTERS = [{ id: 'bob', weight: 1 }, { id: 'bobby', weight: 3 }];

    beforeEach((done) => {
      createElection(({ payload }) => {
        ELECTION_ID = payload;
        setVoters(ELECTION_ID, DEFAULT_VOTERS, () => {
          lockVoters(ELECTION_ID, () => {
            done();
          });
        });
      });
    });

    afterEach((done) => {
      deleteElection(ELECTION_ID, () => {
        done();
      });
    });

    it('Should return FAILED. No election id', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('FAILED');
          done();
        } catch (error) {
          done(error);
        }
      }
      makeElection(undefined, JSON.stringify(DEFAULT_TEMPLATE), callback);
    });
    it('Should return OK', (done) => {
      function callback(data) {
        try {
          expect(data).toBeDefined();
          expect(data.status).toEqual('OK');
          done();
        } catch (error) {
          done(error);
        }
      }
      makeElection(ELECTION_ID, JSON.stringify(DEFAULT_TEMPLATE), callback);
    });
  });
});
