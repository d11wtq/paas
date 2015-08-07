var util = require('util')
  , shared = require('./shared')
  , HostedZone = require('./HostedZone')
  ;

function applicable(config) {
  return !! config.domains;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'DomainRecordSetGroup';
}

function build(config) {
  return {
    'Type': 'AWS::Route53::RecordSetGroup',
    'Properties': {
      'HostedZoneId': zoneId(config),
      'HostedZoneName': zoneName(config),
      'RecordSets': recordSets(config)
    }
  };
}

// -- Private

function absoluteName(name) {
  return name.replace(/([^.])$/, '$1.');
}

function zoneId(config) {
  if (config.domains.zone) {
    return {'Ref': 'AWS::NoValue'};
  } else {
    return {'Ref': HostedZone.key(config)};
  }
}

function zoneName(config) {
  if (config.domains.zone) {
    return absoluteName(config.domains.zone);
  } else {
    return {'Ref': 'AWS::NoValue'};
  }
}

function recordSets(config) {
  return Object.keys(config.domains)
    .filter(function(name){
      return name != 'zone';
    })
    .map(function(name){
      return config.domains[name]
        .map(function(definition){
          if (definition.alias) {
            return {
              'AliasTarget': aliasTarget(config, definition),
              'Name': absoluteName(name),
              'Type': definition.in,
            };
          } else {
            return {
              'Name': absoluteName(name),
              'ResourceRecords': records(definition),
              'TTL': definition.ttl,
              'Type': definition.in,
            };
          }
        });
    })
    .reduce(function(a, b){
      return a.concat(b);
    });
}

function aliasTarget(config, definition) {
  return {
    'DNSName': absoluteName(definition.alias),
    'HostedZoneId': (definition.zone_id || zoneId(config))
  };
}

function records(definition) {
  switch (definition.in) {
    case 'TXT':
      return definition.records.map(normalizeTXTdata);

    default:
      return definition.records;
  }
}

function normalizeTXTdata(data){
  if (isQuoted(data)) {
    return data;
  } else {
    return util.format(
      '"%s"',
      data.replace(/(["\\])/g, '\\$1')
    );
  }
}

function isQuoted(s) {
  return s.charAt(0) == '"' && s.charAt(s.length-1) == '"';
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
