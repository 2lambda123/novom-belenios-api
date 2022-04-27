import closeElection from '../../../lib/belenios/admin/closeElection';
import openElection from '../../../lib/belenios/admin/openElection';
import clearElectionDir from '../../../lib/helpers/clearElectionsDir';
import electionFilesToObject from '../../../lib/helpers/electionFilesToObject';
import joinElection from '../../../lib/belenios/voter/joinElection';
import { Election, User, Vote } from '../../../models';
import computeVoters from '../../../lib/belenios/admin/computeVoters';
import protectedResolver from '../../protectedResolver';
import sleep from '../../../lib/sleep/sleep';
import countMaxVotesAndVoters from '../../../lib/belenios/admin/countMaxVotesAndVoters';
import downloadElectionToLocalFiles from '../../../lib/helpers/downloadElectionToLocalFiles';

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
        const electionId = openElection(votersList, template);
        const {
          maxVotes,
          maxVoters,
        } = countMaxVotesAndVoters(votersList);
        const { files, users } = electionFilesToObject(electionId);
        const election = {
          files,
          status: 'OPEN',
          template,
          maxVotes,
          maxVoters,
          votesSentCount: 0,
          ttl,
        };
        const { id } = await Election.create(election);
        await User.createBatch(users, id);
        return id;
      },
    }),
    closeElection: protectedResolver({
      role: 'admin',
      resolver: async (_, { id }) => {
        async function tryCloseElection(election, retries) {
          if (retries <= 0) return undefined;

          const {
            id: electionId,
            votesSentCount,
          } = election;
          const ballots = await Vote.UNSAFE_getAllWithParent(id);
          const totalVotesVersions = ballots.reduce((acc, { version }) => (acc + version), 0);

          if (totalVotesVersions === votesSentCount) {
            await downloadElectionToLocalFiles(id);

            const result = closeElection(electionId);

            await Election.update(electionId, { result: result[0] });

            return result[0];
          }

          await sleep(100);

          return tryCloseElection(election, retries - 1);
        }

        await Election.update(id, { status: 'CLOSED' });

        const election = await Election.get(id, { ConsistentRead: true });

        return election.electionResult || tryCloseElection(election, 3);
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
