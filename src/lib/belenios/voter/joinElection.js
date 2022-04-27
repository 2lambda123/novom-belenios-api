import fs from 'fs';
import path from 'path';
import log from '../../logger/log';
import {
  ELECTIONS_DIR,
  PRIVATE_CREDENTIALS_FILE_NAME,
} from '../global';

function joinElection(electionId, userId) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const privCredFilePath = path.join(electionDir, PRIVATE_CREDENTIALS_FILE_NAME);
    const data = fs.readFileSync(privCredFilePath, 'utf8');
    const users = data.split('\n');
    const user = users.find((u) => u && u.startsWith(`${userId},`));
    const userCred = user.split(' ')[1];
    return userCred;
  } catch (error) {
    log('error', error);
  }
  return undefined;
}

export default joinElection;
