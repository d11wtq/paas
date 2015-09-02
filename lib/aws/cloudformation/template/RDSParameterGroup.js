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
  return 'RDSParameterGroup';
}

function build(config) {
  return {
    'Type': 'AWS::RDS::DBParameterGroup',
    'Properties': {
      'Description': {
        'Fn::Join': [
          '/',
          [
            {'Ref': 'AWS::StackName'},
            key(config)
          ]
        ]
      },
      'Family': family(config),
      'Parameters': Object(config.database.parameters),
      'Tags': shared.tags(key(config)),
    }
  };
}

function outputs(config) {
  return Object();
}

// -- Private

function family(config) {
  var parts = config.database.engine.split('/');

  return [
    parts[0],
    parts[1].split('.').slice(0, 2).join('.')
  ].join('');
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
