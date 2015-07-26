var shared = require('./shared')
  , NATSecurityGroup = require('./NATSecurityGroup')
  , Subnet = require('./Subnet')
  , VPC = require('./VPC')
  ;

function applicable(config) {
  return VPC.applicable(config) && shared.someNatRoutes(config);
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'NATInstance';
}

function build(config) {
  return {
    'Type': 'AWS::EC2::Instance',
    'Properties': {
      'ImageId': config.network.nat.ami,
      'InstanceType': config.network.nat.type,
      'SecurityGroupIds': [
        {'Ref': NATSecurityGroup.key(config)}
      ],
      'SourceDestCheck': false,
      'SubnetId': {'Ref': Subnet.key(publicSubnetContext(config))},
      'Tags': shared.tags(key(config))
    }
  };
}

function publicSubnetContext(config) {
  return Subnet.contexts(config)
    .filter(function(c){ return c.context.name == 'public' })[0];
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
