import fs from 'fs';
import path from 'path';
import log from '../../logger/log';
import {
  ELECTIONS_DIR, ELECTION_FILE_NAME, PRIVATE_CREDS_FILE_NAME, TRUSTEES_FILE_NAME,
} from '../global';

function joinElection(electionId, userId, socket, callback) {
  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;

    if (!electionDir || !fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    const privCredFilePath = path.join(electionDir, PRIVATE_CREDS_FILE_NAME);

    if (!fs.existsSync(privCredFilePath)) {
      callback({ status: 'FAILED', error: 'Private credentials file does not exist.' });
      return;
    }

    const data = fs.readFileSync(privCredFilePath, 'utf8');
    const users = data.split('\n');
    const user = users.filter((u) => u && u.startsWith(`${userId},`));
    const userCred = user.length === 1 ? user[0].split(' ')[1] : undefined;

    if (!userCred) {
      callback({ status: 'FAILED', error: 'Voter not found.' });
      return;
    }

    socket.join(electionId);
    // eslint-disable-next-line no-param-reassign
    socket.privCred = userCred;

    const election = fs.readFileSync(path.join(electionDir, TRUSTEES_FILE_NAME), 'utf8');
    const trustees = fs.readFileSync(path.join(electionDir, ELECTION_FILE_NAME), 'utf8');

    callback({ status: 'OK', payload: { election, trustees, privCred: userCred } });
  } catch (error) {
    log('error', error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default joinElection;
