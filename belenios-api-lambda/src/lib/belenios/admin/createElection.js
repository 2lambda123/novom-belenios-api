import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import log from '../../logger/log';
import { ELECTIONS_DIR } from '../global';

/**
 *
 * @returns {String} electionId
 */

function createElection() {
  try {
    const electionId = execSync('bash src/scripts/createElection.sh').toString();
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    fs.mkdirSync(electionDir);
    return electionId;
  } catch (error) {
    log('error', error);
  }
  return undefined;
}

export default createElection;
