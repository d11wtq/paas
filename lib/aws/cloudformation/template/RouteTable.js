var util = require('util')
  , _ = require('lodash')
  , shared = require('./shared')
  , VPC = require('./VPC')
  ;

function applicable(config) {
  return !! config.network;
}

function contexts(config) {
  return Object.keys(config.network.subnets)
    .map(function(name){
      var context = {name: name};

      return _.extend(
        Object(),
        config,
        {context: context}
      );
    });
}

function key(config) {
  return util.format(
    '%sRouteTable',
    _.capitalize(config.context.name)
  );
}

function build(config) {
  return {
    'Type': 'AWS::EC2::RouteTable',
    'Properties': {
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
