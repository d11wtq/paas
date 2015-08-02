var validate = require('jsonschema').validate
  , schema = require('./schema/instances')
  , _ = require('lodash')
  ;

/*! Default settings */
function defaults(config) {
  return {
    ami: 'ami-9392faa9',
    type: 't2.micro',
    scale: 1
  };
}

/*! Sub-sanitization for the 'instances' key */
function sanitize(config) {
  if (!config.containers) {
    return config;
  } else {
    var normalizedConfig = _.extend(
      Object(),
      config,
      {
        instances: _.extend(
          Object(),
          defaults(config),
          (config.instances || Object())
        )
      }
    );

    [validateSchema].forEach(function(f){ f(normalizedConfig) });

    return normalizedConfig;
  }
}

function validateSchema(config) {
  validate(
    config.instances,
    schema,
    {propertyName: 'instances', throwError: true}
  );
}

module.exports.sanitize = sanitize;
