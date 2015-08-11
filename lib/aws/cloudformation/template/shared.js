var util = require('util')
  , CRC32 = require('crc-32')
  , containersConfig = require('../../../config/containers')
  , loadBalancerConfig = require('../../../config/load-balancer')
  ;

/**
 * Generate a CRC32 checksum for obj, in hexadecimal format.
 *
 * @param {Object} obj
 *   the object to checksum
 *
 * @return {String}
 *   a CRC checksum, hex-encoded with padding
 */
function checksum(obj) {
  var num = CRC32.str(JSON.stringify(obj))
    , hex = Math.abs(num).toString(16)
    ;

  return util.format(
    '%s%s%s',
    (num < 0 ? 'N' : 'P'),
    Array(10 - hex.length).join('0'),
    hex.toUpperCase()
  );
}

/**
 * Get all open instance ports for this config.
 *
 * @param {Object} config
 *   parsed YAML config file
 *
 * @return {Array}
 *   an array of integers
 */
function instancePorts(config) {
  return containersConfig.instancePorts(config);
}

/**
 * Get all open load balancer ports for this config.
 *
 * @param {Object} config
 *   parsed YAML config file
 *
 * @return {Array}
 *   an array of integers
 */
function loadBalancerPorts(config) {
  return Object.keys(loadBalancerPortMap(config))
    .map(function(n){
      return parseInt(n);
    });
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
function loadBalancerPortMap(config) {
  return loadBalancerConfig.portMap(config);
}

/**
 * Return true if this config includes a load balancer.
 *
 * @param {Object} config
 *   parsed YAML config file
 *
 * @return {Boolean}
 *   true if config includes a load balancer
 */
function isLoadBalanced(config) {
  if (!config.containers) {
    return false;
  } else {
    return (config.instances || Object()).traffic == 'load-balance';
  }
}

/**
 * Return the default set of resource tags for {name}.
 *
 * @param {String} name
 *   the name of the cloudformation resource
 *
 * @return {Array}
 *   an array of cloudformation tags
 */
function tags(name) {
  var qualifiedName;

  if (name) {
    qualifiedName = {
      'Fn::Join': [
        '/',
        [
          {'Ref': 'AWS::StackName'},
          name
        ]
      ]
    };
  } else {
    qualifiedName = {'Ref': 'AWS::StackName'};
  }

  return [
    {
      'Key': 'Name',
      'Value': qualifiedName,
    }
  ];
}

/**
 * Return true if any NAT routes are defined.
 *
 * @param {Object} config
 *   parsed YAML config file
 *
 * @return {Boolean}
 *   true if any NAT routes defined
 */
function someNatRoutes(config) {
  if (config.network) {
    return Object.keys(config.network.subnets).some(function(name){
      var subnet = config.network.subnets[name];

      return Object.keys(subnet.routes).some(function(cidr){
        return subnet.routes[cidr] == 'nat';
      });
    });
  } else {
    return false;
  }
}

module.exports.checksum = checksum;
module.exports.isLoadBalanced = isLoadBalanced;
module.exports.instancePorts = instancePorts;
module.exports.loadBalancerPorts = loadBalancerPorts;
module.exports.loadBalancerPortMap = loadBalancerPortMap;
module.exports.someNatRoutes = someNatRoutes;
module.exports.tags = tags;
