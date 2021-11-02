import clearElectionDir from '../../../lib/helpers/clearElectionsDir';
import electionObjectToFiles from '../../../lib/helpers/electionObjectToFiles';
import voteElection from '../../../lib/belenios/voter/vote';
import { Election, Vote } from '../../../models';

const resolver = {
  Query: {
    getAllElectionVotes: async (_, { electionId }) => Vote.UNSAFE_getAllElectionVotes(electionId),
  },
  Mutation: {
    vote: async (_, { electionId, ballot, userCred }) => {
      const election = await Election.get(electionId);

      clearElectionDir();
      electionObjectToFiles(election.id, election.files);
      const encryptedBallot = voteElection(electionId, userCred, JSON.stringify([ballot]));

      const publicKey = JSON.parse(encryptedBallot).signature.public_key;
      const vote = {
        id: publicKey,
        electionId,
        ballot: encryptedBallot,
      };

      return Vote.transactionVote(vote);
    },
  },
};

export default resolver;
