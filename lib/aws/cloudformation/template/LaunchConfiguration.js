var InstanceSecurityGroup = require('./InstanceSecurityGroup')
  , docker = require('./docker')
  ;

function applicable(config) {
  return !! config.instances;
}

function contexts(config) {
  return [config];
}

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

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
