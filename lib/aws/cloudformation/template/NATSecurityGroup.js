var shared = require('./shared')
  , VPC = require('./VPC')
  ;

function applicable(config) {
  return VPC.applicable(config) && shared.someNatRoutes(config);
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'NATSecurityGroup';
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
            'NATSecurityGroup'
          ]
        ]
      },
      'SecurityGroupIngress': [
        {
          'CidrIp': config.network.cidr,
          'FromPort': -1,
          'IpProtocol': -1,
          'ToPort': -1
        }
      ],
      'Tags': shared.tags(key(config)),
      'VpcId': {'Ref': VPC.key(config)}
    }
  };
}

function outputs(config) {
  return Object();
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
