import deepmerge from 'deepmerge';

import election from './election';
import vote from './vote';

export const typeDefs = [
  election.typeDef,
  vote.typeDef,
];

export const resolvers = deepmerge.all([
  election.resolver,
  vote.resolver,
]);
