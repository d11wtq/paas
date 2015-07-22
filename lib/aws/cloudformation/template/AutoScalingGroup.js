var util = require('util')
  , LaunchConfiguration = require('./LaunchConfiguration')
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
      'LaunchConfigurationName': {'Ref': LaunchConfiguration.key(config)},
      'MinSize': config.instances.scale,
      'MaxSize': config.instances.scale,
      'VPCZoneIdentifier': subnets(config)
    }
  };
}

function subnets(config) {
  return config.subnets['private'];
}

module.exports.key = key;
module.exports.build = build;
