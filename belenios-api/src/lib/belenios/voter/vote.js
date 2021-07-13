import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { ELECTIONS_DIR, BALLOTS_FILE_NAME } from '../global';

function saveVote(voteBallot, ballotFilePath) {
  const publicKey = voteBallot.signature.public_key;

  if (!fs.existsSync(ballotFilePath)) {
    fs.writeFileSync(ballotFilePath, '');
  }

  if (publicKey) {
    const ballots = fs.readFileSync(ballotFilePath);

    if (ballots.includes(publicKey)) {
      const newBallots = ballots
        .toString()
        .split('\n')
        .map((line) => (line && line.includes(publicKey) ? JSON.stringify(voteBallot) : line))
        .join('\n');
      fs.writeFileSync(ballotFilePath, newBallots);
    } else {
      fs.appendFileSync(ballotFilePath, `${JSON.stringify(voteBallot)}\n`);
    }

    return true;
  }
  return false;
}

function executeVote(privCred, ballot, ballotFilePath, electionDir, callback) {
  exec(`bash src/scripts/vote.sh ${privCred} ${ballot} ${electionDir}`, (error, stdout) => {
    if (error) {
      console.log(error);
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
    console.log(error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default vote;
