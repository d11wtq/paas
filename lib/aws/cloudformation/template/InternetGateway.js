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
  return 'InternetGateway';
}

function build(config) {
  return {
    'Type': 'AWS::EC2::InternetGateway',
    'Properties': {
      'Tags': shared.tags(key(config))
    }
  };
}

function outputs(config) {
  return Object();
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
