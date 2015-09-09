var validate = require('jsonschema').validate
  , YAML = require('yamljs')
  , aws = require('../aws/service')
  , resolver = require('./resolver')
  , schema = require('./schema')
  ;

/**
 * Load the configuration to use for deployment.
 *
 * @param {HttpRequest} req
 *   the incoming request
 *
 * @param {Function} done
 *   a callback to invoke on completion (err, data)
 */
function fetch(req, done) {
  resolver(aws.factory(req), YAML.parse(req.body), function(err, data){
    try {
      if (err) {
        done(err);
      } else {
        done(
          err,
          sanitize(
            aws.credentials(req).region || 'us-east-1',
            data
          )
        );
      }
    } catch (err) {
      done(err);
    }
  });
}

/**
 * Return a sanitized version of the input config.
 *
 * This adds default values where they need to be added and validates that the
 * input values are correct.
 *
 * @throws {Error}
 *   in the case the input is not valid
 *
 * @param {String} region
 *   AWS region to deploy in
 *
 * @param {Object} config
 *   unsanitized parsed YAML config file
 *
 * @return {Object}
 *   sanitized YAML config file
 */
function sanitize(region, config) {
  var normalizedConfig = [
    require('./depends'),
    require('./network'),
    require('./subnets'),
    require('./containers'),
    require('./instances'),
    require('./load-balancer'),
    require('./monitoring'),
    require('./domains'),
    require('./database'),
  ].reduce(
    function(config, sanitizer){
      return sanitizer.sanitize(region, config);
    },
    config
  );

  validateSchema(normalizedConfig);

  return normalizedConfig;
}

function validateSchema(config) {
  validate(
    config,
    schema,
    {propertyName: 'config', throwError: true}
  );
}

module.exports.fetch = fetch;
module.exports.sanitize = sanitize;
