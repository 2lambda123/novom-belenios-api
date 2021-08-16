import moment from 'moment';

/**
 * A class for creating REST API responses that respect the AWS API Gateway response format.
 */
class ApiResponse {
  constructor(statusCode, body, type) {
    return {
      body,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': type || 'application/json',
        'Last-Modified': moment().utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]'),
      },
      statusCode,
    };
  }
}

export default ApiResponse;
