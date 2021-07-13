import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ELECTIONS_DIR, PRIVATE_CREDS_FILE_NAME } from '../global';

function executeComputeVoters(electionDir, privCredFilePath, callback) {
  exec(`bash src/scripts/computeVoters.sh ${privCredFilePath} ${electionDir}`, (error, stdout) => {
    if (error) {
      callback({ status: 'FAILED', error });
      return;
    }
    const voters = stdout.split('\n').filter((voter) => voter);
    const nbVoters = voters.length;
    const votes = voters.map((voter) => voter.split(',')[1]).filter((vote) => vote);
    const nbVotes = votes && votes.length
      ? Number(votes.reduce((total, voter) => Number(voter) + Number(total))) : 0;
    callback({ status: 'OK', payload: { nbVoters, nbVotes } });
  });
}

function computeVoters(electionId, callback) {
  if (!callback) return;

  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;

    if (!electionDir || !fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    const privCredFilePath = path.join(electionDir, PRIVATE_CREDS_FILE_NAME);

    executeComputeVoters(electionDir, privCredFilePath, callback);
  } catch (error) {
    console.log(error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default computeVoters;
