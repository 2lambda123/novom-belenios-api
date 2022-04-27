import voteElection from '../../../lib/belenios/voter/vote';
import protectedResolver from '../../protectedResolver';
import { Election, Vote } from '../../../models';
import downloadElectionToLocalFiles from '../../../lib/helpers/downloadElectionToLocalFiles';

const resolver = {
  Query: {
    getAllElectionVotes: protectedResolver({
      resolver: async (_, { electionId }) => Vote.UNSAFE_getAllElectionVotes(electionId),
    }),
  },
  Mutation: {
    vote: protectedResolver({
      resolver: async (_, { electionId, ballot, userCred }) => {
        await downloadElectionToLocalFiles(electionId);

        const election = await Election.get(electionId);
        const encryptedBallot = voteElection(electionId, userCred, JSON.stringify([ballot]));
        return Vote.transactionVote(election.id, encryptedBallot, election.ttl);
      },
    }),
  },
};

export default resolver;
