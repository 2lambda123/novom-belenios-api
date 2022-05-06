import aws from 'aws-sdk';
import clearElectionDir from '../../../../lib/helpers/clearElectionsDir';
import joinElection from '../../../../lib/belenios/voter/joinElection';
import { Election } from '../../../../models';
import computeVoters from '../../../../lib/belenios/admin/computeVoters';
import protectedResolver from '../../protectedResolver';
import downloadElectionToLocalFiles from '../../../../lib/helpers/downloadElectionToLocalFiles';

const { LAMBDA_OPEN_ELECTION, LAMBDA_CLOSE_ELECTION } = process.env;

const resolver = {
  Query: {
    getElection: protectedResolver({
      resolver: async (_, { id }) => Election.get(id),
    }),
  },
  Mutation: {
    openElection: protectedResolver({
      role: 'admin',
      resolver: async (_, { votersList, template, ttl }) => {
        clearElectionDir();
        const { id } = await Election.create({ status: 'OPENING', ttl });

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
        return computeVoters(id);
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
