import log from '../../logger/log';
import electionFilesToObject from '../../helpers/electionFilesToObject';

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
