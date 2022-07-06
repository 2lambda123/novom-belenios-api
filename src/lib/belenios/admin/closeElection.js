import { execFileSync } from 'child_process';
import path from 'path';
import {
  ELECTIONS_DIR,
  PARTIAL_DECRYPTIONS_FILE_NAME,
  PRIV_KEYS_FILE_NAME,
  RESULT_FILE_NAME,
} from '../global';
import log from '../../logger/log';

/**
 * Close an election.
 * Return the election result compiled.
 *
 * @param {string} electionId
 * @returns {Array.<Array.<Number>>}
 */

function closeElection(electionId) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const privateKeysFileName = path.join(electionDir, PRIV_KEYS_FILE_NAME);
    const partialDecryptionsFilePath = path.join(electionDir, PARTIAL_DECRYPTIONS_FILE_NAME);
    const resultFilePath = path.join(electionDir, RESULT_FILE_NAME);
    const { result } = JSON.parse(
      execFileSync('src/scripts/closeElection.sh', [privateKeysFileName, partialDecryptionsFilePath, resultFilePath, electionDir]).toString(),
    );
    return result;
  } catch (error) {
    log('error', error);
  }
  return undefined;
}

export default closeElection;
