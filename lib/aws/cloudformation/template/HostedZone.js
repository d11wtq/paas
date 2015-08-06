var util = require('util')
  , shared = require('./shared')
  ;

function applicable(config) {
  return !! config.zone;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'HostedZone';
}

function build(config) {
  return {
    'Type': 'AWS::Route53::HostedZone',
    'Properties': {
      'Name': absoluteName(config.zone),
      'HostedZoneTags': shared.tags(key(config))
    }
  };
}

// -- Private

function absoluteName(name) {
  return name.replace(/([^.])$/, '$1.');
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
