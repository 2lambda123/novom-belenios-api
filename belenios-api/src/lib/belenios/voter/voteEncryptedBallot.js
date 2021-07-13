import fs from 'fs';
import path from 'path';
import { BALLOTS_FILE_NAME, ELECTIONS_DIR } from '../global';
import log from '../../../log';
import saveVote from './saveVote';

function voteEncryptedBallot(electionId, encryptedBallot, callback) {
  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;

    if (!electionDir || !fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    const ballotFilePath = path.join(electionDir, BALLOTS_FILE_NAME);

    if (saveVote(JSON.parse(encryptedBallot), ballotFilePath)) {
      callback({ status: 'OK' });
    } else {
      callback({ status: 'FAILED', error: 'Invalid ballot' });
    }
  } catch (error) {
    log('error', error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default voteEncryptedBallot;
