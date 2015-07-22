var shared = require('./shared');

function key(config) {
  return 'InstanceSecurityGroup';
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
            'InstanceSecurityGroup'
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
  return shared.hostPorts(config)
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
