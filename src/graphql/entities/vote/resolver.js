import clearElectionDir from '../../../lib/helpers/clearElectionsDir';
import electionObjectToFiles from '../../../lib/helpers/electionObjectToFiles';
import voteElection from '../../../lib/belenios/voter/vote';
import protectedResolver from '../../protectedResolver';
import { Election, Vote } from '../../../models';

const resolver = {
  Query: {
    getAllElectionVotes: protectedResolver({
      resolver: async (_, { electionId }) => Vote.UNSAFE_getAllElectionVotes(electionId),
    }),
  },
  Mutation: {
    vote: protectedResolver({
      resolver: async (_, { electionId, ballot, userCred }) => {
        const election = await Election.get(electionId);

        clearElectionDir();
        electionObjectToFiles(election.id, election.files);
        const encryptedBallot = voteElection(electionId, userCred, JSON.stringify([ballot]));

        return Vote.transactionVote(election.id, encryptedBallot);
      },
    }),
  },
};

export default resolver;
