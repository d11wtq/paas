var InstanceSecurityGroup = require('./InstanceSecurityGroup')
  , docker = require('./docker')
  ;

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
      ],
      'UserData': {'Fn::Base64': docker.script(config)},
    }
  };
}

module.exports.key = key;
module.exports.build = build;
