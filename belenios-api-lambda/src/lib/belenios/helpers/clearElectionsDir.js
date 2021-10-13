import rimraf from 'rimraf';
import { ELECTIONS_DIR } from '../global';

function clearElectionDir() {
  rimraf.sync(`${ELECTIONS_DIR}/*`);
}

export default clearElectionDir;
