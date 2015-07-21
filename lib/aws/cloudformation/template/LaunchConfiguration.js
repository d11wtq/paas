function key(config) {
  return 'LaunchConfiguration';
}

function build(config) {
  return {
    'Type': 'AWS::AutoScaling::LaunchConfiguration',
    'Properties': {
    }
  };
}

module.exports.key = key;
module.exports.build = build;
