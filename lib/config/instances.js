var validate = require('jsonschema').validate
  , schema = require('./schema/instances')
  , util = require('util')
  , _ = require('lodash')
  , dockerAMI = require('./mappings/docker-ami')
  , containers = require('./containers')
  ;

/*! Default settings */
function defaults(region, config) {
  return {
    ami: dockerAMI[region],
    type: 't2.micro',
    scale: 1,
    traffic: 'load-balance',
    subnet: 'private',
    ports: containers.instancePorts(config)
  };
}

/*! Sub-sanitization for the 'instances' key */
function sanitize(region, config) {
  if (! (config.containers || config.instances)) {
    return config;
  } else {
    var normalizedConfig = _.extend(
      Object(),
      config,
      {
        instances: _.extend(
          Object(),
          defaults(region, config),
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
        Object.keys(config.subnets || Object())
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
