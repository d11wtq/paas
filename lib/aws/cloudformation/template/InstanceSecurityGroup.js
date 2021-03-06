var shared = require('./shared')
  , securityGroup = require('./security-group')
  ;

function applicable(config) {
  return !! config.instances;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'InstanceSecurityGroup';
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
  return appPorts(config).concat(sshPorts(config));
}

function appPorts(config) {
  return config.instances.ports;
}

function sshPorts(config) {
  if (config.instances.ssh) {
    return [22];
  } else {
    return [];
  }
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
