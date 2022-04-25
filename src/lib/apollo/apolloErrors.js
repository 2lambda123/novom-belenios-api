import { ApolloError, AuthenticationError, ForbiddenError } from 'apollo-server-lambda';

export const INVALID_TOKEN = new ForbiddenError('Invalid token');
export const TOKEN_EXPIRED = new ForbiddenError('Token expired');

export const UNAUTHORIZED = new AuthenticationError('Unauthorized');
export const LOGGED_IN_ANOTHER_BROWSER = new AuthenticationError('Logged in another browser');
export const VERSION_MISMATCH = new AuthenticationError('Version mismatch');

export const ACCOUNT_NOT_ALLOWED = new ApolloError('Account not allowed', 403);
export const ACCOUNT_LOCKED = new ApolloError('Account locked', 403);
export const BANNED = new ApolloError('User banned', 403);
export const CUSTOM_MESSAGE_TOO_LONG = new ApolloError('Custom message is too long');
export const EVENT_ACCESS_DENIED = new ApolloError('Event access denied', 403);
export const INVALID_EVENT_PASSWORD = new ApolloError('Invalid event password', 403);
export const EVENT_ALREADY_ASSOCIATED = new ApolloError('Event already associated', 400);
export const EVENT_NOT_OPEN_LOGIN = new ApolloError('Event is not allowing open login');
export const EVENT_NOT_STARTED = new ApolloError('Event not started', 403);
export const EVENT_UNACCESSIBLE = new ApolloError('Event unaccessible', 403);
export const EVENT_TERMINATED = new ApolloError('Event terminated', 403);
export const GUESTS_NOT_ALLOWED = new ApolloError('Guests not allowed', 403);
export const GUEST_NOT_VERIFIED = new ApolloError('Guest not verified', 403);
export const USER_NOT_VERIFIED = new ApolloError('User email not verified', 403);
export const GUESTS_CANNOT_REDEEM = new ApolloError('Guests cannot redeem multiple invitations', 403);
export const INVALID_TICKET = new ApolloError('Invalid ticket', 400);
export const INVALID_EMAIL = new ApolloError('Invalid email', 400);
export const NOT_FOUND = new ApolloError('Resource not found', 404);
export const TWO_FACTOR_INVITATION_FAILED = new ApolloError('Two-factor invitation failed', 403);
export const USER_NOT_FOUND = new ApolloError('User not found', 404);
export const USERNAME_TAKEN = new ApolloError('Username is already taken', 409);
export const RECOVERY_LINK_STILL_VALID = new ApolloError('Previous recovery link still valid', 403);
export const SSO_CONFIG_NOT_FOUND = new ApolloError('No SSO configuration found', 404);
export const PASSWORD_NOT_MATCHING = new ApolloError('Current password doesn\'t match our records', 403);

export default {
  NOT_FOUND,
  UNAUTHORIZED,
  USERNAME_TAKEN,
};
