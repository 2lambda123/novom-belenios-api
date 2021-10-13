import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import {
  ELECTIONS_DIR,
  PARTIAL_DECRYPTIONS_FILE_NAME,
  PRIV_KEYS_FILE_NAME,
  RESULT_FILE_NAME,
} from '../global';
import log from '../../logger/log';

function closeElection(electionId) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const privateKeysFileName = path.join(electionDir, PRIV_KEYS_FILE_NAME);
    const partialDecryptionsFilePath = path.join(electionDir, PARTIAL_DECRYPTIONS_FILE_NAME);
    const resultFilePath = path.join(electionDir, RESULT_FILE_NAME);
    const { result } = JSON.parse(
      execSync(`bash src/scripts/closeElection.sh ${privateKeysFileName} ${partialDecryptionsFilePath} ${resultFilePath} ${electionDir}`).toString(),
    );
    return result;
  } catch (error) {
    log('error', error);
  }
  return undefined;
}

export default closeElection;
