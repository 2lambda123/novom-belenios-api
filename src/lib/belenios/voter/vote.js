import { execSync } from 'child_process';
import path from 'path';
import { ELECTIONS_DIR } from '../global';
import log from '../../logger/log';

/**
 * Create an encrypted ballot for an attendee.
 * Return the encrypted ballot.
 *
 * @param {string} electionId
 * @param {string} privCred
 * @param {string} ballot
 * @returns
 */

function vote(electionId, privCred, ballot) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const encryptedBallot = execSync(`bash src/scripts/vote.sh ${privCred} ${ballot} ${electionDir}`).toString();
    return encryptedBallot;
  } catch (error) {
    log('error', error);
  }
  return undefined;
}

export default vote;
