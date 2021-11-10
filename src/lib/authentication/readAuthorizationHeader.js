import { UNAUTHORIZED } from '../../graphql/apolloErrors';

function readAuthorizationHeader(authorizationHeader) {
  if (!authorizationHeader) return null;

  const [type, token] = authorizationHeader.split(' ');

  if (type !== 'Bearer') {
    throw UNAUTHORIZED;
  }

  return token;
}

export default readAuthorizationHeader;
