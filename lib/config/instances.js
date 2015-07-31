var validate = require('jsonschema').validate
  , schema = require('./schema/instances')
  , _ = require('lodash')
  ;

/*! Default settings */
var DEFAULTS = {
  ami: 'ami-9392faa9', // FIXME: Read this from a map
  type: 't2.micro',
  scale: 1
};

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
          DEFAULTS,
          (config.instances || Object())
        )
      }
    );

    [
      validateSchema
    ].forEach(function(f){ f(normalizedConfig) });

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
