import { AuthenticationError } from 'apollo-server-lambda';

export const UNAUTHORIZED = new AuthenticationError('Unauthorized');

export default {
  UNAUTHORIZED,
};
