var util = require('util')
  , shared = require('./shared')
  ;

function applicable(config) {
  return !! config.network;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'VPC';
}

function build(config) {
  return {
    'Type': 'AWS::EC2::VPC',
    'Properties': {
      'CidrBlock': config.network.cidr,
      'Tags': shared.tags(key(config))
    }
  };
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
