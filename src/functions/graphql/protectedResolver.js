import { UNAUTHORIZED } from './apolloErrors';

/**
 * Secure a graphql resolver by making sure the requester has a given role when trying
 * to execute it.
 *
 * @param {Object} params
 * @param {('admin')} params.role The action that is attempting to be made.
 * @returns {GraphQLResolver} Secured GraphQL resolver function.
 */

function protectedResolver(params) {
  const {
    role,
    resolver,
  } = params;

  return async (parent, args, context, info) => {
    const { decodedToken } = context;
    if (!decodedToken) throw UNAUTHORIZED;

    const { extraPayload: { accessRole } } = decodedToken;
    if (role && role !== accessRole) throw UNAUTHORIZED;

    return resolver(parent, args, context, info);
  };
}

export default protectedResolver;
