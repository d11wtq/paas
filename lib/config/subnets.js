var validate = require('jsonschema').validate
  , schema = require('./schema/subnets')
  , _ = require('lodash')
  ;

/*! Sub-sanitization for the 'subnets' key */
function sanitize(config) {
  if (!config.containers) {
    return config;
  } else {
    validateSchema(config);
    return config;
  }
}

function validateSchema(config) {
  validate(
    (config.subnets || Object()),
    schema,
    {propertyName: 'subnets', throwError: true}
  );
}

module.exports.sanitize = sanitize;
