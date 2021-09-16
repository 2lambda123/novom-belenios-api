import createElection from '../../../lib/belenios/admin/createElection';
import { Election } from '../../../models';

const resolver = {
  Query: {
    getElections: async (_, ids) => Election.batchGet(ids),
    getElection: async (_, id) => Election.get(id),
  },
  Mutation: {
    createElection: async () => {
      const electionId = createElection();
      const election = {
        id: electionId,
        status: 'OPEN',
      };
      await Election.put(election);
      return election;
    },
    closeElection: async () => { },
    computeVoters: async () => { },
  },
};

export default resolver;
