import rimfaf from 'rimraf';
import path from 'path';
import fs from 'fs';
import { ELECTIONS_DIR } from '../global';

function deleteElection(electionId, callback) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    if (fs.existsSync(electionDir)) {
      rimfaf.sync(electionDir);
    }
    callback({ status: 'OK' });
  } catch (error) {
    console.log(error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default deleteElection;
