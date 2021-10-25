import { ApolloServer } from 'apollo-server-lambda';

import { typeDefs, resolvers } from './entities';

const server = new ApolloServer({ typeDefs, resolvers });

exports.graphqlHandler = server.createHandler();
