import closeElection from '../../../lib/belenios/admin/closeElection';
import openElection from '../../../lib/belenios/admin/openElection';
import clearElectionDir from '../../../lib/helpers/clearElectionsDir';
import electionFilesToObject from '../../../lib/helpers/electionFilesToObject';
import electionObjectToFiles from '../../../lib/helpers/electionObjectToFiles';
import joinElection from '../../../lib/belenios/voter/joinElection';
import { Election, Vote } from '../../../models';
import { BALLOTS_FILE_NAME } from '../../../lib/belenios/global';
import computeVoters from '../../../lib/belenios/admin/computeVoters';

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
      return electionId;
    },
    closeElection: async (_, { id }) => {
      const {
        id: electionId,
        files,
        status,
        result: electionResult,
      } = await Election.get(id);

      if (status === 'OPEN') {
        await Election.update(electionId, { status: 'CLOSED' });

        const ballots = await Vote.query({
          ExpressionAttributeNames: {
            '#electionId': 'electionId',
          },
          ExpressionAttributeValues: {
            ':electionId': electionId,
          },
          KeyConditionExpression: '#electionId = :electionId',
          IndexName: process.env.DYNAMODB_VOTE_TABLE_GSI_ELECTION_ID,
        });

        const ballotFile = {
          content: ballots.map(({ ballot }) => ballot).join(''),
          name: BALLOTS_FILE_NAME,
        };

        clearElectionDir();
        electionObjectToFiles(electionId, [...files, ballotFile]);
        const result = closeElection(electionId);

        await Election.update(electionId, { result: result[0] });

        return result[0];
      }

      return electionResult;
    },
    computeVoters: async (_, { id }) => {
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
        content: ballots.map(({ ballot }) => ballot).join(''),
        name: BALLOTS_FILE_NAME,
      };

      clearElectionDir();
      electionObjectToFiles(election.id, [...election.files, ballotFile]);

      return computeVoters(id);
    },
    joinElection: async (_, { id, userId }) => {
      const election = await Election.get(id);

      clearElectionDir();
      electionObjectToFiles(election.id, election.files);

      return joinElection(id, userId);
    },
  },
};

export default resolver;
