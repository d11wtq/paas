var util = require('util')
  , shared = require('./shared')
  , securityGroup = require('./security-group')
  ;

function applicable(config) {
  return !! config.database;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'RDSInstanceSecurityGroup';
}

function build(config) {
  return securityGroup.build(
    key(config),
    config.vpc,
    ports(config)
  );
}

function outputs(config) {
  return Object();
}

// -- Private

function ports(config) {
  return [config.database.port];
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
