import { jwtVerify } from 'jose';

import { UNAUTHORIZED } from '../../functions/graphql/apolloErrors';
import settings from '../../settings';

import log from '../logger/log';

const { algorithm, secretKey } = settings.authorization.jwt;
const connexionKey = Buffer.from(secretKey);

/**
 * @param {string} token
 * @param {object} options
 * @param {string} options.alg
 * @param {string} options.key
 * @param {string} maxAge
 * @returns
 */
export async function verifyJwtWithOptions(token, { alg, key }, maxAge = undefined) {
  if (token) {
    try {
      const decoded = await jwtVerify(token, Buffer.from(key), {
        algorithms: [alg],
        maxTokenAge: maxAge,
      });
      return decoded.payload;
    } catch (err) {
      log('error', err);
      throw UNAUTHORIZED;
    }
  }

  return null;
}

/**
 * @param {string} token
 * @param {string} maxAge
 * @returns
 */
export async function verifyJwt(token, maxAge = undefined) {
  if (token) {
    try {
      const decoded = await jwtVerify(token, connexionKey, {
        algorithms: [algorithm],
        maxTokenAge: maxAge,
      });
      return decoded.payload;
    } catch (err) {
      log('error', err);
      throw UNAUTHORIZED;
    }
  }

  return null;
}
