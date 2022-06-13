import rimraf from 'rimraf';
import path from 'path';
import fs from 'fs';
import { ELECTIONS_DIR } from '../global';
import log from '../../logger/log';

/**
 * Delete election folder and all it's files.
 * Return true on success.
 *
 * @param {string} electionId
 * @returns {boolean}
 */

function deleteElection(electionId) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    if (electionDir && fs.existsSync(electionDir)) {
      rimraf.sync(electionDir);
    }
    return true;
  } catch (error) {
    log('error', error);
    return false;
  }
}

export default deleteElection;
