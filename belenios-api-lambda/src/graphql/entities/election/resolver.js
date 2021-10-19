import closeElection from '../../../lib/belenios/admin/closeElection';
import openElection from '../../../lib/belenios/admin/openElection';
import clearElectionDir from '../../../lib/helpers/clearElectionsDir';
import electionFilesToObject from '../../../lib/helpers/electionFilesToObject';
import electionObjectToFiles from '../../../lib/helpers/electionObjectToFiles';
import joinElection from '../../../lib/belenios/voter/joinElection';
import { Election, Vote } from '../../../models';
import { BALLOTS_FILE_NAME } from '../../../lib/belenios/global';

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
      const election = await Election.get(id);
      const ballots = await Vote.query({
        ExpressionAttributeNames: {
          '#electionId': 'electionId',
        },
        ExpressionAttributeValues: {
          ':electionId': id,
        },
        KeyConditionExpression: '#electionId = :electionId',
        IndexName: process.env.DYNAMODB_VOTE_TABLE_GSI_ELECTION_ID,
      });

      const ballotFile = {
        content: ballots.map(({ ballot }) => ballot).join('/n'),
        name: BALLOTS_FILE_NAME,
      };

      clearElectionDir();
      electionObjectToFiles(election.id, [...election.files, ballotFile]);
      const result = closeElection(election.id);

      const closedElection = {
        id,
        result: result[0],
        status: 'CLOSED',
      };
      await Election.put(closedElection);
      return closedElection;
    },
    computeVoters: async () => { },
    joinElection: async (_, { id, userId }) => {
      const election = await Election.get(id);

      clearElectionDir();
      electionObjectToFiles(election.id, election.files);

      return joinElection(id, userId);
    },
  },
};

export default resolver;
