var util = require('util')
  , _ = require('lodash')
  , RouteTable = require('./RouteTable')
  , Subnet = require('./Subnet')
  ;

function applicable(config) {
  return !! config.network;
}

function contexts(config) {
  return Subnet.contexts(config)
}

function key(config) {
  return util.format(
    '%sRouteTableAssociation%s',
    _.capitalize(config.context.name),
    config.context.az.toUpperCase()
  );
}

function build(config) {
  return {
    'Type': 'AWS::EC2::SubnetRouteTableAssociation',
    'Properties': {
      'RouteTableId': {'Ref': RouteTable.key(config)},
      'SubnetId': {'Ref': Subnet.key(config)}
    }
  };
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
