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
      validateProtocolLayers,
      validateDomain,
    ].forEach(function(f){ f(normalizedConfig) });

    return normalizedConfig;
  }
}

/**
 * Get information about forwarded ports on the load balancer.
 *
 * @param {Object} config
 *   parsed YAML config
 *
 * @return {Array}
 *   an array of e.g. {
 *     port: n,
 *     type: 'tcp',
 *     destination: {
 *       port: n,
 *       type: 'tcp'
 *     }
 *   }
 */
function portForwards(config) {
  var mapping = config['load-balancer'].ports
    , wrap = {
        'http': 'http',
        'https': 'http',
        'tcp': 'tcp',
        'ssl': 'tcp',
      };

  return Object.keys(mapping)
    .map(function(portAndType){
      var forward = parsePort(portAndType);

      return _.extend(
        Object(),
        forward,
        {destination: parsePort(mapping[portAndType], wrap[forward.type])},
        (
          isSSL(forward)
            ? {certificate: config['load-balancer'].certificate}
            : Object()
        )
      );
    });
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
  portForwards(config).forEach(function(forward){
    if (!validPort(forward.port)) {
      throw new Error(
        util.format(
          'load-balancer.ports[%d]: must be in %s or >=1024',
          forward.port,
          VALID_PORTS
        )
      );
    }
  });
}

function validateInstancePorts(config) {
  var instancePorts = containers.instancePorts(config);

  portForwards(config).forEach(function(forward){
    if (instancePorts.indexOf(forward.destination.port) == -1) {
      throw new Error(
        util.format(
          'load-balancer.ports[%d]: no containers publishing port %d',
          forward.port,
          forward.destination.port
        )
      );
    }
  });
}

function validateProtocolLayers(config) {
  portForwards(config).forEach(function(forward){
    if (!sameProtocolLayer(forward.type, forward.destination.type)) {
      throw new Error(
        util.format(
          'load-balancer.ports[%d]: protocol %s can only forward to %s',
          forward.port,
          forward.type,
          protocolsAtLayer(forward.type)
        )
      );
    }
  });
}

function sameProtocolLayer(source, destination) {
  return protocolsAtLayer(source).indexOf(destination) != -1;
}

function protocolsAtLayer(type) {
  switch (type) {
    case 'http':
    case 'https':
      return ['http', 'https'];

    case 'tcp':
    case 'ssl':
      return ['tcp', 'ssl'];
  }
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

function parsePort(str, defaultType) {
  var pair = str.toString().split('/');

  return {
    port: parseInt(pair[0]),
    type: (pair[1] || defaultType || 'tcp'),
  };
}

function isSSL(forward) {
  return forward.type == 'https' || forward.type == 'ssl';
}

function validateSchema(config) {
  validate(
    config['load-balancer'],
    schema,
    {propertyName: 'load-balancer', throwError: true}
  );
}

module.exports.sanitize = sanitize;
module.exports.portForwards = portForwards;
