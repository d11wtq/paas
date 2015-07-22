var InstanceSecurityGroup = require('./InstanceSecurityGroup');

function key(config) {
  return 'LaunchConfiguration';
}

function build(config) {
  return {
    'Type': 'AWS::AutoScaling::LaunchConfiguration',
    'Properties': {
      'ImageId': config.instances.ami,
      'InstanceMonitoring': false,
      'InstanceType': config.instances.type,
      'SecurityGroups': [
        {'Ref': InstanceSecurityGroup.key(config)}
      ]
    }
  };
}

module.exports.key = key;
module.exports.build = build;
