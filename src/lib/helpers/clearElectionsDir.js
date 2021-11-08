import rimraf from 'rimraf';
import { ELECTIONS_DIR } from '../belenios/global';

function clearElectionDir() {
  rimraf.sync(`${ELECTIONS_DIR}/*`);
}

export default clearElectionDir;
