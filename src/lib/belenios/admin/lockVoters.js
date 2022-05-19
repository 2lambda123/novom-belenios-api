import path from 'path';
import { execFileSync } from 'child_process';
import { VOTERS_FILE_NAME, ELECTIONS_DIR, GROUP_FILE_PATH } from '../global';
import log from '../../logger/log';

/**
 *
 * @param {String} electionId
 * @returns
 */

function lockVoters(electionId) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const votersFilePath = path.join(electionDir, VOTERS_FILE_NAME);
    execFileSync('src/scripts/makeTrustees.sh', [electionId, votersFilePath, GROUP_FILE_PATH, electionDir]).toString();
    return true;
  } catch (error) {
    log('error', error);
  }
  return false;
}

export default lockVoters;
