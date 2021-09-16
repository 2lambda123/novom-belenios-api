import { execSync } from 'child_process';

/**
 * @return {String} electionId
 */
function createElection() {
  const electionId = execSync('bash src/scripts/createElection.sh').toString();
  return electionId;
}

export default createElection;
