var util = require('util')
  , shared = require('./shared')
  , RDSInstance = require('./RDSInstance')
  ;

function applicable(config) {
  return RDSInstance.applicable(config)
    && !! config.database.domain
    ;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'RDSInstanceDomainCname';
}

function build(config) {
  return {
    'Type': 'AWS::Route53::RecordSet',
    'Properties': {
      'HostedZoneName': absoluteName(config.database.domain.zone),
      'Name': absoluteName(config.database.domain.name),
      'ResourceRecords': records(config),
      'TTL': 60,
      'Type': 'CNAME',
    }
  };
}

function outputs(config) {
  return Object();
}

// -- Private

function absoluteName(name) {
  return name.replace(/([^.])$/, '$1.');
}

function records(config) {
  return [{
    'Fn::GetAtt': [
      RDSInstance.key(config),
      'Endpoint.Address'
    ]
  }];
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
