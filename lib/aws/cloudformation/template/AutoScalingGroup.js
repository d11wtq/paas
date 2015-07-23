var util = require('util')
  , shared = require('./shared')
  , LaunchConfiguration = require('./LaunchConfiguration')
  , LoadBalancer = require('./LoadBalancer')
  ;

function key(config) {
  return util.format(
    'AutoScalingGroupVER%s',
    config.version
  );
}

function build(config) {
  return {
    'Type': 'AWS::AutoScaling::AutoScalingGroup',
    'Properties': {
      'HealthCheckGracePeriod': config.monitoring.grace,
      'HealthCheckType': 'ELB',
      'LaunchConfigurationName': {'Ref': LaunchConfiguration.key(config)},
      'LoadBalancerNames': [
        {'Ref': LoadBalancer.key(config)}
      ],
      'MaxSize': config.instances.scale,
      'MinSize': config.instances.scale,
      'Tags': tags(config),
      'VPCZoneIdentifier': subnets(config),
    },
    'CreationPolicy': {
      'ResourceSignal': {
        'Count': config.instances.scale,
        'Timeout': util.format('PT%dS', config.monitoring.grace)
      }
    }
  };
}

function tags(config) {
  return shared.tags().map(function(t){
    return {
      'Key': t.Key,
      'Value': t.Value,
      'PropagateAtLaunch': true,
    };
  });
}

function subnets(config) {
  return config.subnets['private'];
}

module.exports.key = key;
module.exports.build = build;
