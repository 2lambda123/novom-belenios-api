/* eslint-disable no-console */
import moment from 'moment';

/**
 * Log messages to the console.
 *
 * @param {'log' | 'info' | 'warn' | 'error'} level
 * @param {string} message
 * @param  {...any} rest
 */
function log(level, message, ...rest) {
  const logDate = moment.utc().toISOString();
  const timestampedMessage = `${logDate} - ${message}`;
  const { NODE_ENV = 'development' } = process.env;

  switch (level) {
    case 'error':
      console.error(timestampedMessage, ...rest);
      break;

    case 'warn':
      console.warn(timestampedMessage, ...rest);
      break;

    case 'info':
      console.log(timestampedMessage, ...rest);
      break;

    case 'log':
    default:
      if (NODE_ENV !== 'production') console.log(timestampedMessage, ...rest);
      break;
  }
}

export default log;
