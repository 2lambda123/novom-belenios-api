import fs from 'fs';
import path from 'path';
import { ELECTIONS_DIR } from '../global';

function subscribeElection(electionId, socket, callback) {
  if (!callback) return;

  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;

    if (!electionDir || !fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    socket.join(electionId);
    callback({ status: 'OK' });
  } catch (error) {
    console.log(error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default subscribeElection;
