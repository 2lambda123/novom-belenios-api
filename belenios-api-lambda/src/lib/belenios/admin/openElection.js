import createElection from './createElection';
import deleteElection from './deleteElection';
import lockVoters from './lockVoters';
import makeElection from './makeElection';
import setVoters from './setVoters';

/**
 *
 * @param {String} votersList
 * @param {String} template
 * @returns
 */

function openElection(votersList, template) {
  const electionId = createElection();
  if (setVoters(electionId, votersList)
    && lockVoters(electionId)
    && makeElection(electionId, template)) {
    return electionId;
  }
  if (electionId) {
    deleteElection(electionId);
  }
  return undefined;
}

export default openElection;
