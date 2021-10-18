import closeElection from '../../../lib/belenios/admin/closeElection';
import openElection from '../../../lib/belenios/admin/openElection';
import clearElectionDir from '../../../lib/belenios/helpers/clearElectionsDir';
import electionFilesToObject from '../../../lib/belenios/helpers/electionFilesToObject';
import electionObjectToFiles from '../../../lib/belenios/helpers/electionObjectToFiles';
import joinElection from '../../../lib/belenios/voter/joinElection';
import { Election } from '../../../models';

const resolver = {
  Query: {
    getElections: async (_, { ids }) => Election.batchGet(ids),
    getElection: async (_, { id }) => Election.get(id),
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
      return { id: election.id, status: election.status };
    },
    closeElection: async (_, { id }) => {
      clearElectionDir();
      const election = await Election.get(id);
      electionObjectToFiles(election.id, election.files);
      const result = closeElection(election.id);
      const closedElection = {
        id,
        result: result[0],
        status: 'CLOSED',
      };
      await Election.put({ id, result: result[0], status: 'CLOSED' });
      return closedElection;
    },
    computeVoters: async () => { },
    joinElection: async (_, { id, userId }) => {
      clearElectionDir();
      const election = await Election.get(id);
      electionObjectToFiles(election.id, election.files);
      return joinElection(id, userId);
    },
  },
};

export default resolver;
