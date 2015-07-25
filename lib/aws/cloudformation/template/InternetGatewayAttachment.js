var util = require('util')
  , shared = require('./shared')
  , InternetGateway = require('./InternetGateway')
  , VPC = require('./VPC')
  ;

function applicable(config) {
  return !! config.network;
}

function contexts(config) {
  return [config];
}

function key(config) {
  return 'InternetGatewayAttachment';
}

function build(config) {
  return {
    'Type': 'AWS::EC2::VPCGatewayAttachment',
    'Properties': {
      'InternetGatewayId': {'Ref': InternetGateway.key(config)},
      'VpcId': {'Ref': VPC.key(config)}
    }
  };
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
