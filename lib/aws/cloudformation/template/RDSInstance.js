var util = require('util')
  , shared = require('./shared')
  , RDSInstanceSecurityGroup = require('./RDSInstanceSecurityGroup')
  , RDSSubnetGroup = require('./RDSSubnetGroup')
  ;

function applicable(config) {
  return !! config.database;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'RDSInstance';
}

function build(config) {
  return {
    'Type': 'AWS::RDS::DBInstance',
    'Properties': {
      'AllocatedStorage': config.database['disk-size'],
      'AllowMajorVersionUpgrade': true,
      'DBInstanceClass': config.database.type,
      'DBSubnetGroupName': {'Ref': RDSSubnetGroup.key(config)},
      'Engine': engine(config),
      'EngineVersion': engineVersion(config),
      'MasterUsername': config.database.username,
      'MasterUserPassword': config.database.password,
      'MultiAZ': true,
      'Port': config.database.port,
      'StorageType': 'gp2',
      'Tags': shared.tags(key(config)),
      'VPCSecurityGroups': [
        {'Ref': RDSInstanceSecurityGroup.key(config)}
      ]
    }
  };
}

function outputs(config) {
  return Object();
}

// -- Private

function engine(config) {
  return config.database.engine.split('/')[0];
}

function engineVersion(config) {
  return config.database.engine.split('/')[1] || {'Ref': 'AWS::NoValue'};
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
