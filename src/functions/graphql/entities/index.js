import deepmerge from 'deepmerge';

import election from './election';
import vote from './vote';
import baseTypes from './baseTypes.graphql';

export const typeDefs = [
  election.typeDef,
  vote.typeDef,
  baseTypes,
];

export const resolvers = deepmerge.all([
  election.resolver,
  vote.resolver,
]);
