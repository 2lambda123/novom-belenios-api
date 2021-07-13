import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { VOTERS_FILE_NAME, ELECTIONS_DIR, GROUP_FILE_PATH } from '../global';
import log from '../../../log';

function executeMakeTrustees(electionId, votersFilePath, groupFilePath, electionDir, callback) {
  exec(`bash src/scripts/makeTrustees.sh ${electionId} ${votersFilePath} ${groupFilePath} ${electionDir}`, (error, stdout) => {
    if (error) {
      callback({ status: 'FAILED', error });
      return;
    }
    callback({ status: 'OK', payload: stdout });
  });
}

function lockVoters(electionId, callback) {
  if (!callback) return;

  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;

    if (!electionDir || !fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    const votersFilePath = path.join(electionDir, VOTERS_FILE_NAME);

    if (!fs.existsSync(votersFilePath)) {
      callback({ status: 'FAILED', error: `Election {${electionId}} does not exist.` });
      return;
    }

    executeMakeTrustees(electionId, votersFilePath, GROUP_FILE_PATH, electionDir, callback);
  } catch (error) {
    log('error', error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default lockVoters;
