import fs from 'fs';
import { execFile } from 'child_process';
import path from 'path';
import { ELECTIONS_DIR, BALLOTS_FILE_NAME } from '../global';

function executeVote(privCred, ballot, ballotFilePath, electionDir, callback) {
  const paremeters = [
    privCred,
    ballot,
    ballotFilePath,
    electionDir,
  ];

  execFile('src/scripts/vote.sh', paremeters, (error) => {
    if (error) {
      console.log(error);
      callback({ status: 'FAILED', error });
      return;
    }
    callback({ status: 'OK' });
  });
}

function vote(electionId, privCred, ballot, callback) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);

    if (!fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    const ballotFilePath = path.join(electionDir, BALLOTS_FILE_NAME);

    executeVote(privCred, ballot, ballotFilePath, electionDir, callback);
  } catch (error) {
    console.log(error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default vote;
