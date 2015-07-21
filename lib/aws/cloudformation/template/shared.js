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

module.exports.hostPorts = hostPorts;
module.exports.loadBalancerPorts = loadBalancerPorts;
