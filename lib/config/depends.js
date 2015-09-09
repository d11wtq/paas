var validate = require('jsonschema').validate
  , schema = require('./schema/depends')
  , util = require('util')
  , _ = require('lodash')
  ;

/*! Default values for depends */
function defaults(config) {
  return [];
}

/*! Sub-sanitization for the 'depends' key */
function sanitize(region, config) {
  var normalizedConfig = _.extend(
    Object(),
    {depends: defaults(config)},
    config
  );
  validateSchema(normalizedConfig);
  return normalizedConfig;
}

function validateSchema(config) {
  validate(
    config.depends,
    schema,
    {propertyName: 'depends', throwError: true}
  );
}

module.exports.sanitize = sanitize;
