import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import {
  ELECTIONS_DIR,
  PARTIAL_DECRYPTIONS_FILE_NAME,
  PRIV_KEYS_FILE_NAME,
  RESULT_FILE_NAME,
} from '../global';
import log from '../../../log';

function executeCloseElection(privateKeysFileName,
  partialDecryptionsFilePath,
  resultFilePath,
  electionDir,
  callback) {
  exec(`bash src/scripts/closeElection.sh ${privateKeysFileName} ${partialDecryptionsFilePath} ${resultFilePath} ${electionDir}`,
    (error, stdout) => {
      if (error) {
        callback({ status: 'FAILED', error });
        return;
      }
      const result = JSON.parse(stdout);
      if (result && result.result) {
        callback({ status: 'OK', payload: result.result });
      } else {
        callback({ status: 'FAILED', payload: 'Invalid results' });
      }
    });
}

function closeElection(electionId, callback) {
  if (!callback) return;

  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;

    if (!electionDir || !fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    const privateKeysFileName = path.join(electionDir, PRIV_KEYS_FILE_NAME);
    const partialDecryptionsFilePath = path.join(electionDir, PARTIAL_DECRYPTIONS_FILE_NAME);
    const resultFilePath = path.join(electionDir, RESULT_FILE_NAME);

    executeCloseElection(privateKeysFileName,
      partialDecryptionsFilePath,
      resultFilePath,
      electionDir,
      callback);
  } catch (error) {
    log('error', error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default closeElection;
