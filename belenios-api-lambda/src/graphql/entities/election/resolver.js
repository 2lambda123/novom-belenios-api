import openElection from '../../../lib/belenios/admin/openElection';
import clearElectionDir from '../../../lib/belenios/helpers/clearElectionsDir';
import electionFilesToObject from '../../../lib/belenios/helpers/electionFilesToObject';
import { Election } from '../../../models';

const resolver = {
  Query: {
    getElections: async (_, ids) => Election.batchGet(ids),
    getElection: async (_, id) => Election.get(id),
  },
  Mutation: {
    openElection: async (_, { votersList, template }) => {
      clearElectionDir();
      const electionId = openElection(votersList, template);
      const electionFiles = electionFilesToObject(electionId);
      const election = {
        id: electionId,
        files: electionFiles,
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
