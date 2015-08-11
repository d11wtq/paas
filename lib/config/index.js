var validate = require('jsonschema').validate
  , subnets = require('./subnets')
  , containers = require('./containers')
  , instances = require('./instances')
  , loadBalancer = require('./load-balancer')
  , monitoring = require('./monitoring')
  , domains = require('./domains')
  , schema = require('./schema')
  ;

/**
 * Return a sanitized version of the input config.
 *
 * This adds default values where they need to be added and validates that the
 * input values are correct.
 *
 * @throws {Error}
 *   in the case the input is not valid
 *
 * @param {Object} config
 *   unsanitized parsed YAML config file
 *
 * @return {Object}
 *   sanitized YAML config file
 */
function sanitize(config) {
  var normalizedConfig = [
    subnets,
    containers,
    instances,
    loadBalancer,
    monitoring,
    domains,
  ].reduce(
    function(config, sanitizer){
      return sanitizer.sanitize(config);
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

module.exports.sanitize = sanitize;
