import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { ELECTIONS_DIR, BALLOTS_FILE_NAME } from '../global';
import log from '../../../log';
import saveVote from './saveVote';

function executeVote(privCred, ballot, ballotFilePath, electionDir, callback) {
  exec(`bash src/scripts/vote.sh ${privCred} ${ballot} ${electionDir}`, (error, stdout) => {
    if (error) {
      log('error', error);
      callback({ status: 'FAILED', error });
      return;
    }

    const voteBallot = JSON.parse(stdout);
    saveVote(voteBallot, ballotFilePath);

    callback({ status: 'OK' });
  });
}

function vote(electionId, privCred, ballot, callback) {
  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;

    if (!electionDir || !fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    const ballotFilePath = path.join(electionDir, BALLOTS_FILE_NAME);

    executeVote(privCred, ballot, ballotFilePath, electionDir, callback);
  } catch (error) {
    log('error', error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default vote;
