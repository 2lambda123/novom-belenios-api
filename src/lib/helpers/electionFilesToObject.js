import fs from 'fs';
import path from 'path';
import { ELECTIONS_DIR } from '../belenios/global';

/**
 *
 * @param {String} electionId
 * @returns
 */

function electionFilesToObject(electionId) {
  const electionDir = path.join(ELECTIONS_DIR, electionId);
  const files = fs.readdirSync(electionDir);
  const election = files.map((file) => {
    const fileDir = path.join(electionDir, file);
    const content = fs.readFileSync(fileDir, 'utf8');
    return {
      content,
      name: file,
    };
  });
  return election;
}

export default electionFilesToObject;
