var shared = require('./shared');

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
        {'Ref': 'LoadBalancerSecurityGroup'}
      ],
      'Subnets': subnets(config),
      'Tags': [
        {
          'Key': 'Name',
          'Value': {
            'Fn::Join': [
              '/',
              [
                {'Ref': 'AWS::StackName'},
                'LoadBalancer'
              ]
            ]
          }
        }
      ]
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
