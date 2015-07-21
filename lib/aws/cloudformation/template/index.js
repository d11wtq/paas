var InstanceSecurityGroup = require('./InstanceSecurityGroup')
  , LoadBalancerSecurityGroup = require('./LoadBalancerSecurityGroup')
  , LoadBalancer = require('./LoadBalancer')
  , LaunchConfiguration = require('./LaunchConfiguration')
  ;

/**
 * Convert the parsed YAML config into a CloudFormation template.
 *
 * @param {Object} config
 *   parsed YAML config file
 *
 * @return {Object}
 *   JSON representation of the CloudFormation template
 */
function build(config) {
  /**
   * AutoScalingGroup{Version}
   * LoadBalancerDNSRecord
   */
  return {
    'AWSTemplateFormatVersion': '2010-09-09',
    'Description': config.description,
    'Resources': resources(config)
  };
}

function resources(config) {
  var resources = Object();

  [
    InstanceSecurityGroup,
    LaunchConfiguration,
    LoadBalancer,
    LoadBalancerSecurityGroup
  ].forEach(function(resource){
    resources[resource.key(config)] = resource.build(config);
  });

  return resources;
}

module.exports.build = build;
