import clearElectionDir from '../../../lib/belenios/helpers/clearElectionsDir';
import electionObjectToFiles from '../../../lib/belenios/helpers/electionObjectToFiles';
import vote from '../../../lib/belenios/voter/vote';
import { Election, Vote } from '../../../models';

const resolver = {
  Query: {
    getAllElectionVotes: () => {},
  },
  Mutation: {
    vote: async (_, { electionId, ballot, userCred }) => {
      clearElectionDir();
      const election = await Election.get(electionId);
      electionObjectToFiles(election.id, election.files);
      const encryptedBallot = vote(electionId, userCred, JSON.stringify([ballot]));
      await Vote.put({
        id: `${electionId}_${userCred}`,
        userCred,
        electionId,
        ballot,
      });
      return encryptedBallot;
    },
  },
};

export default resolver;
