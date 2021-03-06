var util = require('util')
  , _ = require('lodash')
  , shared = require('./shared')
  , InternetGateway = require('./InternetGateway')
  , NATInstance = require('./NATInstance')
  , RouteTable = require('./RouteTable')
  ;

function applicable(config) {
  return !! config.network;
}

function contexts(config) {
  return Object.keys(config.network.subnets)
    .map(function(name){
      var subnet = config.network.subnets[name];

      return Object.keys(subnet.routes)
        .map(function(destination){
          var context = {
            destination: destination,
            name: name,
            via: subnet.routes[destination]
          };

          return _.extend(
            Object(),
            config,
            {context: context}
          );
        });
    })
    .reduce(function(a, b){
      return a.concat(b);
    });
}

function key(config) {
  return util.format(
    '%sRoute%s',
    _.capitalize(config.context.name),
    config.context.destination
      .replace(/\./g, 'Dot')
      .replace(/\//g, 'Slash')
  );
}

function build(config) {
  return {
    'Type': 'AWS::EC2::Route',
    'Properties': {
      'DestinationCidrBlock': config.context.destination,
      'GatewayId': {'Ref': gateway(config)},
      'InstanceId': {'Ref': instance(config)},
      'RouteTableId': {'Ref': RouteTable.key(config)}
    }
  };
}

function outputs(config) {
  return Object();
}

// -- Private

function gateway(config) {
  return config.context.via == 'internet'
    ? InternetGateway.key(config)
    : 'AWS::NoValue'
    ;
}

function instance(config) {
  return config.context.via == 'nat'
    ? NATInstance.key(config)
    : 'AWS::NoValue'
    ;
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
