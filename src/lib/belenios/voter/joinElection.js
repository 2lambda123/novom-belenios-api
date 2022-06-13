import log from '../../logger/log';
import electionFilesToObject from '../../helpers/electionFilesToObject';

/**
 * Set the voters list of an election.
 * Return true on success.
 *
 * @param {string} electionId
 * @param {string} voters
 * @returns {boolean}
 */

function joinElection(electionId, userId) {
  try {
    const { users } = electionFilesToObject(electionId);
    const user = users.find(({ privateCred }) => privateCred && privateCred.startsWith(`${userId},`));
    const userCred = user.privateCred.split(' ')[1];
    return userCred;
  } catch (error) {
    log('error', error);
  }
  return undefined;
}

export default joinElection;
