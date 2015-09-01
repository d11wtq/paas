var util = require('util')
  , shared = require('./shared')
  ;

function applicable(config) {
  return !! config.database;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'RDSSubnetGroup';
}

function build(config) {
  return {
    'Type': 'AWS::RDS::DBSubnetGroup',
    'Properties': {
      'DBSubnetGroupDescription': {
        'Fn::Join': [
          '/',
          [
            {'Ref': 'AWS::StackName'},
            'DBSubnetGroup'
          ]
        ]
      },
      'SubnetIds': subnetIds(config),
      'Tags': shared.tags(key(config)),
    }
  };
}

function outputs(config) {
  return Object();
}

// -- Private

function subnetIds(config) {
  return config.subnets[config.database.subnet];
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
