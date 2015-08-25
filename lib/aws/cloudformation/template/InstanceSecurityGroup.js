var shared = require('./shared');

function applicable(config) {
  return !! config.instances;
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

function outputs(config) {
  return Object();
}

// -- Private

function ingress(config) {
  return appIngress(config).concat(sshIngress(config));
}

function appIngress(config) {
  return config.instances.ports
    .map(function(n){
      return {
        'IpProtocol': 'tcp',
        'CidrIp': '0.0.0.0/0',
        'FromPort': n == -1 ? 0 : n,
        'ToPort': n == -1 ? 65535 : n,
      };
    });
}

function sshIngress(config) {
  if (config.instances.ssh) {
    return [
      {
        'IpProtocol': 'tcp',
        'CidrIp': '0.0.0.0/0',
        'FromPort': 22,
        'ToPort': 22,
      }
    ];
  } else {
    return [];
  }
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
