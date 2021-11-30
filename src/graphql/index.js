import { ApolloServer } from 'apollo-server-lambda';

import readAuthorizationHeader from '../lib/authentication/readAuthorizationHeader';
import verifyJwt from '../lib/authentication/verifyJwt';
import settings from '../settings';

import { typeDefs, resolvers } from './entities';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ event, context }) => {
    const { Authorization } = event.headers;

    const contextToDispatch = {
      headers: event.headers,
      lambdaContext: context,
      responseCookies: [],
      responseHeaders: [],
    };

    if (Authorization !== 'None') {
      try {
        const encodedToken = readAuthorizationHeader(Authorization);
        const decodedToken = verifyJwt(encodedToken);

        contextToDispatch.decodedToken = decodedToken;
      } catch (error) {
        // no-op
      }
    }

    return contextToDispatch;
  },
});

exports.graphqlHandler = server.createHandler({
  expressGetMiddlewareOptions: {
    cors: {
      credentials: true,
      origin: settings.allowedOrigin,
    },
  },
});
