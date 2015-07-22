var shared = require('./shared')
  , LoadBalancerSecurityGroup = require('./LoadBalancerSecurityGroup')
  ;

function key(config) {
  return 'LoadBalancer';
}

function build(config) {
  return {
    'Type': 'AWS::ElasticLoadBalancing::LoadBalancer',
    'Properties': {
      'CrossZone': true,
      'Listeners': listeners(config),
      'SecurityGroups': [
        {'Ref': LoadBalancerSecurityGroup.key(config)}
      ],
      'Subnets': subnets(config),
      'Tags': shared.tags(key(config))
    }
  };
}

function listeners(config) {
  return shared.loadBalancerPorts(config)
    .map(function(n){
      return {
        'Protocol': 'TCP',
        'InstanceProtocol': 'TCP',
        'LoadBalancerPort': n,
        'InstancePort': n,
      };
    });
}

function subnets(config) {
  return config.subnets['public'];
}

module.exports.key = key;
module.exports.build = build;
