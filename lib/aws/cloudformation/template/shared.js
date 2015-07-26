function hostPorts(config) {
  return Object.keys(config.containers)
    .map(function(k){
      return config.containers[k];
    })
    .map(function(c){
      return Object.keys(c.ports || Object());
    })
    .reduce(function(a, b){
      return a.concat(b);
    });
}

function loadBalancerPorts(config) {
  return hostPorts(config);
}

function tags(name) {
  var qualifiedName;

  if (name) {
    qualifiedName = {
      'Fn::Join': [
        '/',
        [
          {'Ref': 'AWS::StackName'},
          name
        ]
      ]
    };
  } else {
    qualifiedName = {'Ref': 'AWS::StackName'};
  }

  return [
    {
      'Key': 'Name',
      'Value': qualifiedName,
    }
  ];
}

function someNatRoutes(config) {
  if (config.network) {
    return Object.keys(config.network.subnets).some(function(name){
      var subnet = config.network.subnets[name];

      return Object.keys(subnet.routes).some(function(cidr){
        return subnet.routes[cidr] == 'nat';
      });
    });
  } else {
    return false;
  }
}

module.exports.hostPorts = hostPorts;
module.exports.loadBalancerPorts = loadBalancerPorts;
module.exports.someNatRoutes = someNatRoutes;
module.exports.tags = tags;
