var util = require('util')
  , shared = require('./shared')
  , LoadBalancer = require('./LoadBalancer')
  ;

function applicable(config) {
  return shared.isLoadBalanced(config)
    && !! config['load-balancer'].domain
    ;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'LoadBalancerDomainAlias';
}

function build(config) {
  return {
    'Type': 'AWS::Route53::RecordSet',
    'Properties': {
      'AliasTarget': aliasTarget(config),
      'HostedZoneName': absoluteName(config['load-balancer'].domain.zone),
      'Name': absoluteName(config['load-balancer'].domain.name),
      'Type': 'A'
    }
  };
}

function absoluteName(name) {
  return name.replace(/([^.])$/, '$1.');
}

function aliasTarget(config) {
  return {
    'DNSName': {
      'Fn::GetAtt': [
        LoadBalancer.key(config),
        'CanonicalHostedZoneName'
      ]
    },
    'HostedZoneId': {
      'Fn::GetAtt': [
        LoadBalancer.key(config),
        'CanonicalHostedZoneNameID'
      ]
    }
  };
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
