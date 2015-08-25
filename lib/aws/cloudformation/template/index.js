var util = require('util')
  , _ = require('lodash')
  , shared = require('./shared')
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
    'Resources': resources(config),
    'Outputs': {
      'HirdConfig': {
        'Description': 'Configuration data for use by Hird',
        'Value': shared.jsonify(outputs(config))
      }
    }
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

/*! Return all applicable outputs */
function outputs(config) {
  var outputs = Object();

  Object.keys(modules)
    .map(function(name){ return modules[name] })
    .forEach(function(resource){
      if (resource.applicable(config)) {
        resource.contexts(config).forEach(function(context){
          merge(outputs, resource.outputs(context));
          console.log('Outputs is now:', outputs);
        });
      }
    });

  return outputs;
}

/*! Deep merge b into a */
function merge(a, b) {
  Object.keys(b).forEach(function(k){
    if (b[k] === null) {
      a[k] = b[k];
    } else if (Array.isArray(a[k]) && Array.isArray(b[k])) {
      a[k] = a[k].concat(b[k]);
    } else if (typeof a[k] == 'object' && typeof b[k] == 'object') {
      merge(a[k], b[k]);
    } else {
      a[k] = b[k];
    }
  });
}

/*! Export all available resource modules */
Object.keys(modules).forEach(function(name){
  module.exports[name] = modules[name];
});

module.exports.build = build;
