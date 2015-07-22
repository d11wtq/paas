var util = require('util')
  , shared = require('./shared')
  , LoadBalancerSecurityGroup = require('./LoadBalancerSecurityGroup')
  ;

function key(config) {
  return 'LoadBalancer';
}

function build(config) {
  return {
    'Type': 'AWS::ElasticLoadBalancing::LoadBalancer',
    'Properties': {
      'ConnectionDrainingPolicy': {
        'Enabled': true,
        'Timeout': config.monitoring.timeout,
      },
      'CrossZone': true,
      'HealthCheck': {
        'HealthyThreshold': 2,
        'Interval': config.monitoring.timeout + 5,
        'Target': healthCheckTarget(config),
        'Timeout': config.monitoring.timeout,
        'UnhealthyThreshold': 3,
      },
      'Listeners': listeners(config),
      'SecurityGroups': [
        {'Ref': LoadBalancerSecurityGroup.key(config)}
      ],
      'Subnets': subnets(config),
      'Tags': shared.tags(key(config)),
    }
  };
}

function listeners(config) {
  return shared.loadBalancerPorts(config)
    .map(function(n){
      return {
        'Protocol': 'TCP',
        'InstanceProtocol': 'TCP',
        'LoadBalancerPort': n,
        'InstancePort': n,
      };
    });
}

function subnets(config) {
  return config.subnets['public'];
}

function healthCheckTarget(config) {
  var monitoring = config.monitoring;

  switch (monitoring.type.toLowerCase()) {
    case 'tcp':
    case 'ssl':
      return util.format(
        '%s:%d',
        monitoring.type,
        monitoring.port
      );

    case 'http':
    case 'https':
      return util.format(
        '%s:%d%s',
        monitoring.type,
        monitoring.port,
        monitoring.path
      );

    default:
      throw new Error(
        util.format(
          'Unsupported monitoring type [%s]',
          monitoring.type
        )
      );
  }
};

module.exports.key = key;
module.exports.build = build;
