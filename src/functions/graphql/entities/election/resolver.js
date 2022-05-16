import aws from 'aws-sdk';
import clearElectionDir from '../../../../lib/helpers/clearElectionsDir';
import joinElection from '../../../../lib/belenios/voter/joinElection';
import { Election } from '../../../../models';
import computeVoters from '../../../../lib/belenios/admin/computeVoters';
import protectedResolver from '../../protectedResolver';
import downloadElectionToLocalFiles from '../../../../lib/helpers/downloadElectionToLocalFiles';
import ELECTION_STATUS from '../../../../lib/enums/ElectionStatus';

const { LAMBDA_OPEN_ELECTION, LAMBDA_CLOSE_ELECTION } = process.env;

const resolver = {
  Query: {
    getElection: protectedResolver({
      resolver: async (_, { id }) => Election.get(id),
    }),
    getAllElectionWithParent: protectedResolver({
      resolver: async (_, { parentId, start }) => {
        const result = await Election.getAllWithParent({
          itemsName: 'elections',
          parentId,
          start,
        });
        return result;
      },
    }),
  },
  Mutation: {
    openElection: protectedResolver({
      role: 'admin',
      resolver: async (_, {
        election,
      }) => {
        const {
          votersList,
          template,
          ttl,
          parentId,
        } = election;

        clearElectionDir();
        const { id } = await Election.create({
          status: ELECTION_STATUS.OPENING,
          ttl,
          votersCount: 0,
          votesCount: 0,
        }, parentId);

        const lambda = new aws.Lambda({
          endpoint: `lambda.${process.env.REGION}.amazonaws.com`,
        });

        await lambda.invoke({
          FunctionName: LAMBDA_OPEN_ELECTION,
          InvocationType: 'Event',
          Payload: JSON.stringify({ id, votersList, template }),
        }).promise();

        return id;
      },
    }),
    closeElection: protectedResolver({
      role: 'admin',
      resolver: async (_, { id }) => {
        await Election.update(id, { status: ELECTION_STATUS.CLOSING });

        await downloadElectionToLocalFiles(id);
        const voteAnalytics = await computeVoters(id);
        await Election.update(id, { ...voteAnalytics });

        const lambda = new aws.Lambda({
          endpoint: `lambda.${process.env.REGION}.amazonaws.com`,
        });

        await lambda.invoke({
          FunctionName: LAMBDA_CLOSE_ELECTION,
          InvocationType: 'Event',
          Payload: JSON.stringify({ id }),
        }).promise();
      },
    }),
    computeVoters: protectedResolver({
      role: 'admin',
      resolver: async (_, { id }) => {
        await downloadElectionToLocalFiles(id);

        const voteAnalytics = await computeVoters(id);
        await Election.update(id, { ...voteAnalytics });

        return voteAnalytics;
      },
    }),
    joinElection: protectedResolver({
      resolver: async (_, { id }, context) => {
        await downloadElectionToLocalFiles(id);
        const { decodedToken: { beleniosId } } = context;
        return joinElection(id, beleniosId);
      },
    }),
  },
};

export default resolver;
