var shared = require('./shared');

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
      'Tags': [
        {
          'Key': 'Name',
          'Value': {
            'Fn::Join': [
              '/',
              [
                {'Ref': 'AWS::StackName'},
                'LoadBalancerSecurityGroup'
              ]
            ]
          }
        }
      ],
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

module.exports.key = key;
module.exports.build = build;
