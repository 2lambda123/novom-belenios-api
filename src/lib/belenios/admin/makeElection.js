import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { TEMPLATE_FILE_NAME, ELECTIONS_DIR, GROUP_FILE_PATH } from '../global';
import log from '../../logger/log';

/**
 *
 * @param {String} electionId
 * @param {String} template
 * @returns
 */

function makeElection(electionId, template) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const templateFilePath = path.join(electionDir, TEMPLATE_FILE_NAME);
    fs.writeFileSync(templateFilePath, template);
    execSync(`bash src/scripts/makeElection.sh ${electionId} ${templateFilePath} ${GROUP_FILE_PATH} ${electionDir}`);
    return true;
  } catch (error) {
    log('error', error);
  }
  return false;
}

export default makeElection;
