var shared = require('./shared');

function applicable(config) {
  return shared.isLoadBalanced(config);
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'LoadBalancerSecurityGroup';
}

function build(config) {
  return {
    'Type': 'AWS::EC2::SecurityGroup',
    'Properties': {
      'GroupDescription': {
        'Fn::Join': [
          '/',
          [
            {'Ref': 'AWS::StackName'},
            'LoadBalancerSecurityGroup'
          ]
        ]
      },
      'SecurityGroupIngress': ingress(config),
      'Tags': shared.tags(key(config)),
      'VpcId': config.vpc
    }
  };
}

function ingress(config) {
  return shared.loadBalancerPorts(config)
    .map(function(n){
      return {
        'IpProtocol': 'tcp',
        'CidrIp': '0.0.0.0/0',
        'FromPort': n,
        'ToPort': n
      };
    });
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
