import fs from 'fs';
import path from 'path';
import { ELECTIONS_DIR } from '../belenios/global';

/**
 *
 * @param {String} electionId
 * @param {String} electionFiles
 */

function electionObjectToFiles(electionId, electionFiles) {
  const electionDir = path.join(ELECTIONS_DIR, electionId);
  fs.mkdirSync(electionDir);

  electionFiles.forEach(({ name, content }) => {
    const filePath = path.join(electionDir, name);
    fs.writeFileSync(filePath, content);
  });
}

export default electionObjectToFiles;
