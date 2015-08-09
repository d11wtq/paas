var util = require('util')
  , shared = require('./shared')
  , LaunchConfiguration = require('./LaunchConfiguration')
  , LoadBalancer = require('./LoadBalancer')
  ;

function applicable(config) {
  return !! config.containers;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return util.format(
    'AutoScalingGroup%s',
    shared.checksum(
      [
        LaunchConfiguration.build(config),
        build(config)
      ]
    )
  );
}

function build(config) {
  return {
    'Type': 'AWS::AutoScaling::AutoScalingGroup',
    'Properties': {
      'HealthCheckGracePeriod': config.monitoring.grace,
      'HealthCheckType': 'ELB',
      'LaunchConfigurationName': {'Ref': LaunchConfiguration.key(config)},
      'LoadBalancerNames': loadBalancers(config),
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
  return config.subnets[config.instances.subnet];
}

function loadBalancers(config) {
  if (LoadBalancer.applicable(config)) {
    return [{'Ref': LoadBalancer.key(config)}];
  } else {
    return [];
  }
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
