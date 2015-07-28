var util = require('util')
  , CRC32 = require('crc-32')
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
function hostPorts(config) {
  return Object.keys(config.containers)
    .map(function(k){
      return config.containers[k];
    })
    .map(function(c){
      return Object.keys(c.ports || Object());
    })
    .reduce(function(a, b){
      return a.concat(b);
    });
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
  return hostPorts(config);
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
module.exports.hostPorts = hostPorts;
module.exports.loadBalancerPorts = loadBalancerPorts;
module.exports.someNatRoutes = someNatRoutes;
module.exports.tags = tags;
