var AWS = require('aws-sdk');

/**
 * Get the AWS Credentials from the given request.
 *
 * @param {http.Request} req
 *   the incoming HTTP request
 *
 * @return {Object}
 *   credentials for use by the AWS SDK
 */
function credentials(req) {
  return {
    region: req.headers['x-aws-region'],
    accessKeyId: req.headers['x-aws-access-key-id'],
    secretAccessKey: req.headers['x-aws-secret-access-key'],
  };
}

/**
 * Return a factory to create AWS service clients.
 *
 * @param {http.Request} req
 *   the incoming HTTP request
 *
 * @return {Function}
 *   a function accepting 'name' to return new AWS[name](...).
 */
function factory(req) {
  return function(name){
    return new AWS[name](credentials(req));
  };
}

module.exports.credentials = credentials;
module.exports.factory = factory;
