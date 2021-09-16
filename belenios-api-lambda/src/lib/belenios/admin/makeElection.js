import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { TEMPLATE_FILE_NAME, ELECTIONS_DIR, GROUP_FILE_PATH } from '../global';
import log from '../../logger/log';

function executeMakeElection(electionId, templateFilePath, groupFilePath, electionDir, callback) {
  if (!electionId || !templateFilePath || !groupFilePath || !electionDir) {
    callback({ status: 'FAILED', error: 'Missing parameter' });
  }
  exec(`bash src/scripts/makeElection.sh ${electionId} ${templateFilePath} ${groupFilePath} ${electionDir}`, (error) => {
    if (error) {
      callback({ status: 'FAILED', error });
      return;
    }
    callback({ status: 'OK' });
  });
}

function makeElection(electionId, template, callback) {
  if (!callback) return;

  if (!template) {
    callback({ status: 'FAILED', error: 'Invalid template' });
    return;
  }

  try {
    const electionDir = electionId ? path.join(ELECTIONS_DIR, electionId) : undefined;

    if (!electionDir || !fs.existsSync(electionDir)) {
      callback({ status: 'FAILED', error: `Election ${electionId} does not exist.` });
      return;
    }

    const templateFilePath = path.join(electionDir, TEMPLATE_FILE_NAME);
    fs.writeFile(templateFilePath, template, (error) => {
      if (error) {
        callback({ status: 'FAILED', error });
        return;
      }
      executeMakeElection(electionId, templateFilePath, GROUP_FILE_PATH, electionDir, callback);
    });
  } catch (error) {
    log('error', error);
    callback({ status: 'FAILED', error: error.message });
  }
}

export default makeElection;
