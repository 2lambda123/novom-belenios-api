import rimraf from 'rimraf';
import { ELECTIONS_DIR } from '../belenios/global';

/**
 * Delete all election from the election dir.
 *
 * @param {string} electionId
 * @returns
 */

function clearElectionDir() {
  rimraf.sync(`${ELECTIONS_DIR}/*`);
}

export default clearElectionDir;
