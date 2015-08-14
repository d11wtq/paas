var util = require('util')
  , _ = require('lodash')
  ;

/*! Extensible resource modules */
var modules = [
  'AutoScalingGroup',
  'DomainRecordSetGroup',
  'HostedZone',
  'InstanceSecurityGroup',
  'InternetGateway',
  'InternetGatewayAttachment',
  'LaunchConfiguration',
  'LoadBalancer',
  'LoadBalancerDomainAlias',
  'LoadBalancerSecurityGroup',
  'NATInstance',
  'NATSecurityGroup',
  'Route',
  'RouteTable',
  'RouteTableAssociation',
  'Subnet',
  'VPC'
].reduce(
  function(acc, name){
    return _.set(
      acc,
      [name],
      require(util.format('./%s', name))
    );
  },
  Object()
);

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
  return {
    'AWSTemplateFormatVersion': '2010-09-09',
    'Description': config.description,
    'Resources': resources(config)
  };
}

/*! Return all applicable resources */
function resources(config) {
  var resources = Object();

  Object.keys(modules)
    .map(function(name){ return modules[name] })
    .forEach(function(resource){
      if (resource.applicable(config)) {
        resource.contexts(config).forEach(function(context){
          resources[resource.key(context)] = resource.build(context);
        });
      }
    });

  return resources;
}

/*! Export all available resource modules */
Object.keys(modules).forEach(function(name){
  module.exports[name] = modules[name];
});

module.exports.build = build;
