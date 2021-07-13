import rimfaf from 'rimraf';
import path from 'path';
import fs from 'fs';
import { ELECTIONS_DIR } from '../global';

function deleteElection(electionId, callback) {
  if (!callback) return;

  if (!electionId) {
    callback({ status: 'FAILED', error: 'Invalid election id' });
    return;
  }

  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;
    if (electionDir && fs.existsSync(electionDir)) {
      rimfaf.sync(electionDir);
    }
    callback({ status: 'OK' });
  } catch (error) {
    console.log(error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default deleteElection;
