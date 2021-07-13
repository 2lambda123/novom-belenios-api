import fs from 'fs';
import path from 'path';
import log from '../../../log';
import { ELECTIONS_DIR, PRIVATE_CREDS_FILE_NAME } from '../global';

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
      callback({ status: 'FAILED', error: 'Voters' });
      return;
    }

    socket.join(electionId);
    // eslint-disable-next-line no-param-reassign
    socket.privCred = userCred;

    callback({ status: 'OK' });
  } catch (error) {
    log('error', error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default joinElection;
