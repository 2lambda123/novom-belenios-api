import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import log from '../../logger/log';
import { ELECTIONS_DIR } from '../global';

/**
 * Create a new election.
 * Return the election id.
 *
 * @returns {string|undefined}
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
