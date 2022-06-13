import closeElection from '../../../lib/belenios/admin/closeElection';
import ELECTION_STATUS from '../../../lib/enums/ElectionStatus';
import downloadElectionToLocalFiles from '../../../lib/helpers/downloadElectionToLocalFiles';
import sleep from '../../../lib/sleep/sleep';
import { Election, Vote } from '../../../models';

async function tryCloseElection(election, retries) {
  if (retries <= 0) return undefined;

  const {
    id: electionId,
    votesSentCount,
  } = election;
  const ballots = await Vote.UNSAFE_getAllWithParent(electionId);
  const totalVotesVersions = ballots.reduce((acc, { version }) => (acc + version), 0);

  if (totalVotesVersions === votesSentCount) {
    await downloadElectionToLocalFiles(electionId);

    const result = closeElection(electionId);

    return result[0];
  }

  await sleep(100);

  return tryCloseElection(election, retries - 1);
}

async function handler(event) {
  const { id } = event;

  const election = await Election.get(id, { ConsistentRead: true });
  const result = await tryCloseElection(election, 10);

  await Election.update(id, { result, status: ELECTION_STATUS.CLOSED });

  return { statusCode: 200 };
}

export default handler;
