var validate = require('jsonschema').validate
  , schema = require('./schema/load-balancer')
  , util = require('util')
  , _ = require('lodash')
  , containers = require('./containers')
  ;

/*! Valid ELB port numbers */
var VALID_PORTS = [25, 80, 443, 465, 587];

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
  validateInstancePorts(config);
}

function validateLoadBalancerPorts(config) {
  Object.keys(config['load-balancer'].ports)
    .forEach(function(port){
      if (!validPort(port)) {
        throw new Error(
          util.format(
            'load-balancer.ports[%d]: must be in %s or >=1024',
            port,
            VALID_PORTS
          )
        );
      }
    });
}

function validateInstancePorts(config) {
  var instancePorts = containers.instancePorts(config);

  Object.keys(config['load-balancer'].ports)
    .forEach(function(n){
      var port = config['load-balancer'].ports[n];

      if (instancePorts.indexOf(port) == -1) {
        throw new Error(
          util.format(
            'load-balancer.ports[%d]: no containers publishing port %d',
            n,
            port
          )
        );
      }
    });
}

function defaultPorts(config) {
  return containers.instancePorts(config)
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
    return VALID_PORTS.indexOf(parseInt(port)) != -1;
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
