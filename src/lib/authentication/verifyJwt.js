import jwt from 'jsonwebtoken';
import { UNAUTHORIZED } from '../../graphql/apolloErrors';
import settings from '../../settings';

import log from '../logger/log';

const { algorithm, secretKey } = settings.authorization.jwt;

/**
 * Verify that the authorization token is valid.
 *
 * @param {string} token
 * @param {import('jsonwebtoken').VerifyOptions} [options]
 * @returns
 */
function verifyJwt(token, options = {}) {
  if (token) {
    try {
      const decodedToken = jwt.verify(
        token,
        secretKey,
        {
          clockTolerance: 2,
          ...options,
          algorithms: [algorithm],
        },
      );

      return decodedToken;
    } catch (error) {
      log('error', error);
      throw UNAUTHORIZED;
    }
  }

  return null;
}

export default verifyJwt;
