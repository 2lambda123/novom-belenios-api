import clearElectionDir from '../../../lib/helpers/clearElectionsDir';
import { Election, User } from '../../../models';
import countMaxVotesAndVoters from '../../../lib/belenios/admin/countMaxVotesAndVoters';
import electionFilesToObject from '../../../lib/helpers/electionFilesToObject';
import openElection from '../../../lib/belenios/admin/openElection';

async function handler(event) {
  const { id, votersList, template } = event;

  clearElectionDir();
  const electionId = openElection(votersList, template);
  const { maxVotes, maxVoters } = countMaxVotesAndVoters(votersList);
  const { files, users } = electionFilesToObject(electionId);

  await User.createBatch(users, id);
  await Election.update(id, {
    files,
    maxVotes,
    maxVoters,
    status: 'OPEN',
    template,
    votesSentCount: 0,
  });

  return { statusCode: 200 };
}

export default handler;
