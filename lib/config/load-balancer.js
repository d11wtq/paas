var validate = require('jsonschema').validate
  , schema = require('./schema/load-balancer')
  , util = require('util')
  , _ = require('lodash')
  , containersConfig = require('./containers')
  ;

/*! Default settings */
function defaults(config) {
  return {
    subnet: 'public',
    ports: defaultPorts(config),
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
      validatePorts,
      validateDomain,
    ].forEach(function(f){ f(normalizedConfig) });

    return normalizedConfig;
  }
}

/**
 * Get all mapped ports on the load balancer.
 *
 * @param {Object} config
 *   parsed YAML config
 *
 * @return {Object}
 *   an object with loadBalancerPort keys and instancePort values
 */
function portMap(config) {
  var mapping = ((config['load-balancer'] || Object()).ports || Object());

  return Object.keys(mapping)
    .reduce(
      function(acc, port){
        return _.set(
          acc,
          [parseInt(port)],
          parseInt(mapping[port])
        );
      },
      Object()
    );
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

function validatePorts(config) {
  validateLoadBalancerPorts(config);
  // FIXME: Validate InstancePorts are actually bound
}

function validateLoadBalancerPorts(config) {
  Object.keys(config['load-balancer'].ports)
    .forEach(function(port){
      if (!validPort(port)) {
        throw new Error(
          util.format(
            'load-balancer.ports[%d]: must be in 25, 80, 443, 465, 587, >=1024',
            port
          )
        );
      }
    });
}

function defaultPorts(config) {
  return containersConfig.instancePorts(config)
    .reduce(
      function(acc, port){
        if (validPort(port)) {
          return _.set(
            acc,
            [port],
            port
          );
        } else {
          return acc;
        }
      },
      Object()
    );
}

function validPort(port) {
  if (parseInt(port) >= 1024) {
    return true;
  } else {
    return [25, 80, 443, 465, 587].some(function(n){
      return parseInt(port) == n;
    });
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
module.exports.portMap = portMap;
