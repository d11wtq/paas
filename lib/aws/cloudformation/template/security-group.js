var shared = require('./shared');

function build(name, vpc, ports) {
  return {
    'Type': 'AWS::EC2::SecurityGroup',
    'Properties': {
      'GroupDescription': {
        'Fn::Join': [
          '/',
          [
            {'Ref': 'AWS::StackName'},
            name
          ]
        ]
      },
      'SecurityGroupIngress': ingress(ports),
      'Tags': shared.tags(name),
      'VpcId': vpc,
    }
  };
}

// -- Private

function ingress(ports) {
  return ports
    .map(function(n){
      return {
        'IpProtocol': 'tcp',
        'CidrIp': '0.0.0.0/0',
        'FromPort': n == -1 ? 0 : n,
        'ToPort': n == -1 ? 65535 : n,
      };
    });
}

module.exports.build = build;
