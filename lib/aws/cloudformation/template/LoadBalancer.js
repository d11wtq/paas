var util = require('util')
  , shared = require('./shared')
  , LoadBalancerSecurityGroup = require('./LoadBalancerSecurityGroup')
  ;

function applicable(config) {
  return shared.isLoadBalanced(config);
}

function contexts(config) {
  return [config];
}

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
        'HealthyThreshold': config.monitoring.threshold.up,
        'Interval': config.monitoring.interval,
        'Target': healthCheckTarget(config),
        'Timeout': config.monitoring.timeout,
        'UnhealthyThreshold': config.monitoring.threshold.down,
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
  return config.subnets[config['load-balancer'].subnet];
}

function healthCheckTarget(config) {
  var monitoring = config.monitoring
    , type = monitoring.type.toUpperCase()
    , port = monitoring.port
    , path = monitoring.path
    ;

  switch (type) {
    case 'TCP':
    case 'SSL':
      return util.format('%s:%d', type, port);

    case 'HTTP':
    case 'HTTPS':
      return util.format('%s:%d%s', type, port, path);

    default:
      throw new Error(
        util.format(
          'Unsupported monitoring type [%s]',
          monitoring.type
        )
      );
  }
};

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
