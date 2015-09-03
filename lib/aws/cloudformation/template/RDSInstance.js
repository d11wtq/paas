var util = require('util')
  , shared = require('./shared')
  , RDSInstanceSecurityGroup = require('./RDSInstanceSecurityGroup')
  , RDSParameterGroup = require('./RDSParameterGroup')
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
      'DBInstanceIdentifier': {'Ref': 'AWS::StackName'},
      'DBParameterGroupName': {'Ref': RDSParameterGroup.key(config)},
      'DBSubnetGroupName': subnetGroup(config),
      'Engine': engine(config),
      'EngineVersion': engineVersion(config),
      'MasterUsername': username(config),
      'MasterUserPassword': password(config),
      'MultiAZ': !config.database.master,
      'Port': config.database.port,
      'SourceDBInstanceIdentifier': sourceDb(config),
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
  return config.database.engine.split('/')[1];
}

function subnetGroup(config) {
  if (RDSSubnetGroup.applicable(config)) {
    return {'Ref': RDSSubnetGroup.key(config)};
  } else {
    return {'Ref': 'AWS::NoValue'};
  }
}

function username(config) {
  return config.database.username || {'Ref': 'AWS::NoValue'};
}

function password(config) {
  return config.database.password || {'Ref': 'AWS::NoValue'};
}

function sourceDb(config) {
  return config.database.master || {'Ref': 'AWS::NoValue'};
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
