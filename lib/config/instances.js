var validate = require('jsonschema').validate
  , schema = require('./schema/instances')
  , util = require('util')
  , _ = require('lodash')
  ;

/*! Default settings */
function defaults(config) {
  return {
    ami: 'ami-9392faa9',
    type: 't2.micro',
    scale: 1,
    subnet: 'private',
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

    [
      validateSchema,
      validateSubnet,
    ].forEach(function(f){ f(normalizedConfig) });

    return normalizedConfig;
  }
}

function validateSubnet(config) {
  if (!(config.instances.subnet in (config.subnets || Object()))) {
    throw new Error(
      util.format(
        'instances.subnet: "%s" not defined in subnets %s',
        config.instances.subnet,
        util.inspect(Object.keys(config.subnets || Object()))
      )
    );
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
