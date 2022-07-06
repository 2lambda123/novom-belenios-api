import fs from 'fs';
import path from 'path';
import {
  ELECTIONS_DIR,
  ELECTION_FILE_NAME,
  PRIVATE_CREDENTIALS_FILE_NAME,
  PRIV_KEYS_FILE_NAME,
  PUBLIC_CREDENTIALS_FILE_NAME,
  TEMPLATE_FILE_NAME,
  TRUSTEES_FILE_NAME,
  VOTERS_FILE_NAME,
} from '../belenios/global';

function electionFileToObject(electionId, file) {
  const electionDir = path.join(ELECTIONS_DIR, electionId);
  const fileDir = path.join(electionDir, file);
  return { name: file, file: fs.readFileSync(fileDir, 'utf8') };
}

/**
 * Parse election information from files to a object.
 *
 * @param {string} electionId
 * @returns {{
 *  files: Array.<{name: string, file: string}>,
 *  users: Array.<{privateCred: string, publicCred: string, voter: string }>,
 * }>}}
 */

function electionFilesToObject(electionId) {
  const election = electionFileToObject(electionId, ELECTION_FILE_NAME);
  const trustees = electionFileToObject(electionId, TRUSTEES_FILE_NAME);
  const template = electionFileToObject(electionId, TEMPLATE_FILE_NAME);
  const privKeys = electionFileToObject(electionId, PRIV_KEYS_FILE_NAME);

  const {
    file: privCredsFileContent,
  } = electionFileToObject(electionId, PRIVATE_CREDENTIALS_FILE_NAME);
  const {
    file: pubCredsFileContent,
  } = electionFileToObject(electionId, PUBLIC_CREDENTIALS_FILE_NAME);
  const {
    file: votersFileContent,
  } = electionFileToObject(electionId, VOTERS_FILE_NAME);

  const privCredsLines = privCredsFileContent.split('\n').filter((privCreds) => privCreds);
  const pubCredsLines = pubCredsFileContent.split('\n').filter((pubCreds) => pubCreds);
  const votersLines = votersFileContent.split('\n').filter((voter) => voter);

  const users = [];

  for (let i = 0; i < votersLines.length; i += 1) {
    users.push({
      privateCred: privCredsLines[i],
      publicCred: pubCredsLines[i],
      voter: votersLines[i],
    });
  }

  return { files: [election, trustees, template, privKeys], users };
}

export default electionFilesToObject;
