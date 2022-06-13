import { Election, User, Vote } from '../../models';
import {
  BALLOTS_FILE_NAME,
  PRIVATE_CREDENTIALS_FILE_NAME,
  PUBLIC_CREDENTIALS_FILE_NAME,
  VOTERS_FILE_NAME,
} from '../belenios/global';
import clearElectionDir from './clearElectionsDir';
import electionObjectToFiles from './electionObjectToFiles';

/**
 * Clear the election folder and retrieve all the information of the specified election.
 * Must be run before executing any action on the election.
 *
 * @param {string} electionId
 * @returns
 */

async function downloadElectionToLocalFiles(electionId) {
  const election = await Election.get(electionId);
  const ballots = await Vote.UNSAFE_getAllWithParent(electionId);
  const users = await User.UNSAFE_getAllWithParent(electionId);

  const ballotFile = {
    file: ballots.map(({ ballot }) => ballot).join(''),
    name: BALLOTS_FILE_NAME,
  };
  const votersFile = {
    file: users.map(({ voter }) => voter).join('\n'),
    name: VOTERS_FILE_NAME,
  };
  const privateCredentialsFile = {
    file: users.map(({ privateCred }) => privateCred).join('\n'),
    name: PRIVATE_CREDENTIALS_FILE_NAME,
  };
  const publicCredentialsFile = {
    file: users.map(({ publicCred }) => publicCred).join('\n'),
    name: PUBLIC_CREDENTIALS_FILE_NAME,
  };

  clearElectionDir();
  electionObjectToFiles(electionId, [
    ...election.files,
    ballotFile,
    votersFile,
    privateCredentialsFile,
    publicCredentialsFile,
  ]);
}

export default downloadElectionToLocalFiles;
