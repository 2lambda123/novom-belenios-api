import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import log from '../../logger/log';
import { ELECTIONS_DIR } from '../global';

function createElection(callback) {
  if (!callback) return;

  try {
    exec('bash src/scripts/createElection.sh', (error, stdout) => {
      if (error) {
        callback({ status: 'FAILED', error });
        return;
      }

      const electionDir = path.join(ELECTIONS_DIR, stdout);
      fs.mkdirSync(electionDir);

      callback({ status: 'OK', payload: stdout });
    });
  } catch (error) {
    log('error', error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default createElection;
