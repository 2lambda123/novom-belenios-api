const getNodeEnv = require('./getNodeEnv');

const demo = require('../../settings/demo.json');
const development = require('../../settings/development.json');
const production = require('../../settings/production.json');
const rbc = require('../../settings/rbc.json');
const staging = require('../../settings/staging.json');

const settings = {
  demo,
  development,
  production,
  rbc,
  staging,
};

module.exports.getCredentials = () => true;

module.exports.getOrigin = (serverless) => {
  const env = getNodeEnv(serverless);
  return settings[env].allowedOrigin;
};
