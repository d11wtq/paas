function key(config) {
  return 'LaunchConfiguration';
}

function build(config) {
  return {
    'Type': 'AWS::AutoScaling::LaunchConfiguration',
    'Properties': {
      'ImageId': config.instances.ami,
      'InstanceType': config.instances.type
    }
  };
}

module.exports.key = key;
module.exports.build = build;
