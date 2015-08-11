var validate = require('jsonschema').validate
  , schema = require('./schema/load-balancer')
  , util = require('util')
  , _ = require('lodash')
  ;

/*! Default settings */
function defaults(config) {
  return {
    subnet: 'public',
  };
}

/*! Sub-sanitization for the 'load-balancer' key */
function sanitize(config) {
  if (!config['load-balancer']) {
    return config;
  } else {
    var normalizedConfig = _.extend(
      Object(),
      config,
      {
        'load-balancer': _.extend(
          Object(),
          defaults(config),
          (config['load-balancer'] || Object())
        )
      }
    );

    [
      validateSchema,
      validateSubnet,
      validateDomain,
    ].forEach(function(f){ f(normalizedConfig) });

    return normalizedConfig;
  }
}

function validateSubnet(config) {
  if (!(config['load-balancer'].subnet in (config.subnets || Object()))) {
    throw new Error(
      util.format(
        'load-balancer.subnet: "%s" not defined in subnets %s',
        config['load-balancer'].subnet,
        Object.keys(config.subnets || Object())
      )
    );
  }
}

function validateDomain(config) {
  var domain = config['load-balancer'].domain;

  if (domain) {
    if (!_.endsWith(domain.name, domain.zone)) {
      throw new Error(
        util.format(
          'load-balancer.domain: %s is not within zone %s',
          domain.name,
          domain.zone
        )
      );
    }
  }
}

function validateSchema(config) {
  validate(
    config['load-balancer'],
    schema,
    {propertyName: 'load-balancer', throwError: true}
  );
}

module.exports.sanitize = sanitize;
