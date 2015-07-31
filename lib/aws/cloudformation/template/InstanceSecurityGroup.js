var shared = require('./shared');

function applicable(config) {
  return !! config.containers;
}

function contexts(config) {
  return [config];
}

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
  return shared.instancePorts(config)
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
