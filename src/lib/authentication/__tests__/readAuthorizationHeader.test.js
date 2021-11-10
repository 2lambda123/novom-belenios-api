import { AuthenticationError } from 'apollo-server-lambda';

import readAuthorizationHeader from '../readAuthorizationHeader';

it('should read a Bearer Authorization header', () => {
  const header = 'Bearer afakeToken';

  const result = readAuthorizationHeader(header);

  expect(result).toEqual('afakeToken');
});

it('should throw an UNAUTHENTICATED error if type is not Bearer', () => {
  const header = 'Basic AWsd#Adwa=';

  expect(() => readAuthorizationHeader(header)).toThrowError(AuthenticationError);
});

it('should return null if Authorization header is not supplied (falsy)', () => {
  const result = readAuthorizationHeader();

  expect(result).toBeNull();
});
