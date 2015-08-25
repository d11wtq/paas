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
      var subnet = config.network.subnets[name]
        , az = azGenerator('a')
        ;

      return subnet.cidrs.map(function(cidr){
        var context = {
          az: az(),
          cidr: cidr,
          name: name,
          public: subnet.public
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
    '%sSubnet%s',
    _.capitalize(config.context.name),
    config.context.az.toUpperCase()
  );
}

function build(config) {
  return {
    'Type': 'AWS::EC2::Subnet',
    'Properties': {
      'AvailabilityZone': {
        'Fn::Join': [
          '',
          [
            {'Ref': 'AWS::Region'},
            config.context.az
          ]
        ]
      },
      'CidrBlock': config.context.cidr,
      'MapPublicIpOnLaunch': !!config.context.public,
      'Tags': shared.tags(key(config)),
      'VpcId': {'Ref': VPC.key(config)}
    }
  };
}

function outputs(config) {
  return {
    'subnets': _.set(
      Object(),
      [config.context.name],
      [{'Ref': key(config)}]
    )
  }
}

// -- Private

function azGenerator(current) {
  return function(){
    var az = current;
    current = String.fromCharCode(current.charCodeAt(0)+1);
    return az;
  };
}

module.exports.applicable = applicable;
module.exports.contexts = contexts;
module.exports.key = key;
module.exports.build = build;
module.exports.outputs = outputs;
