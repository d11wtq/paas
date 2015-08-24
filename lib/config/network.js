var validate = require('jsonschema').validate
  , Addr = require('netaddr').Addr
  , schema = require('./schema/network')
  , util = require('util')
  , _ = require('lodash')
  , natAMI = require('./mappings/nat-ami')
  ;

/*! Sub-sanitization for the 'network' key */
function sanitize(config) {
  if (!config.network) {
    return config;
  } else {
    var normalizedConfig = sanitizeNetwork(config);

    [
      validateSchema,
      validateCidr,
      validateSubnets,
    ].forEach(function(f){ f(normalizedConfig) });

    return normalizedConfig;
  }
}

function sanitizeNetwork(config) {
  return _.extend(
    Object(),
    config,
    {
      network: {
        cidr: config.network.cidr,
        nat: sanitizeNat(config),
        subnets: sanitizeSubnets(config),
      }
    }
  );
}

function sanitizeNat(config) {
  return _.extend(
    Object(),
    {
      type: 't2.micro',
      ami: natAMI[process.env['AWS_REGION']],
    },
    (config.network.nat || Object())
  );
}

function sanitizeSubnets(config) {
  if (config.network.subnets) {
    return config.network.subnets;
  } else {
    var allocateSubnet = subnetAllocator(config.network.cidr, 24);

    return {
      'public': {
        cidrs: [allocateSubnet(), allocateSubnet()],
        public: true,
        routes: {
          '0.0.0.0/0': 'internet'
        },
      },
      'private': {
        cidrs: [allocateSubnet(), allocateSubnet()],
        public: false,
        routes: {
          '0.0.0.0/0': 'nat'
        },
      }
    };
  }
}

function validateCidr(config) {
  var vpc;

  try {
    vpc = Addr(config.network.cidr);
  } catch (e) {
    throw new Error(
      util.format(
        'network.cidr: %s is not a valid CIDR',
        config.network.cidr
      )
    );
  }

  if (vpc.prefix > 16) {
    throw new Error(
      util.format(
        'network.cidr: must be at least a /16 network',
        config.network.cidr
      )
    );
  }
}

function validateSubnets(config) {
  validateSubnetCidrs(config);
  validateSubnetsOnNetwork(config);
  validateSubnetsExclusive(config);
  validateSubnetRoutes(config);
}

function validateSubnetsExclusive(config) {
  var allSubnets = Object.keys(config.network.subnets)
    .map(function(name){
      return config.network.subnets[name].cidrs;
    })
    .reduce(function(a, b){
      return a.concat(b);
    })
    .map(function(cidr){
      return Addr(cidr);
    });

  Object.keys(config.network.subnets).forEach(function(name){
    config.network.subnets[name].cidrs.forEach(function(cidr){
      var subnet = Addr(cidr);

      var overlappingSubnets = allSubnets
        .filter(function(s){
          return s.intersect(subnet);
        });

      if (overlappingSubnets.length > 1) {
        throw new Error(
          util.format(
            'network.subnets[%s].cidrs: %s are overlapping',
            name,
            overlappingSubnets
          )
        );
      }
    });
  });
}

function validateSubnetsOnNetwork(config) {
  var vpc = Addr(config.network.cidr);

  Object.keys(config.network.subnets).forEach(function(name){
    config.network.subnets[name].cidrs.forEach(function(cidr){
      if (!vpc.contains(Addr(cidr))) {
        throw new Error(
          util.format(
            'network.subnets[%s].cidrs: %s is not within VPC %s',
            name,
            cidr,
            config.network.cidr
          )
        );
      }
    });
  });
}

function validateSubnetCidrs(config) {
  var vpc = Addr(config.network.cidr);

  Object.keys(config.network.subnets).forEach(function(name){
    config.network.subnets[name].cidrs.forEach(function(cidr){
      try {
        Addr(cidr);
      } catch (e) {
        throw new Error(
          util.format(
            'network.subnets[%s].cidrs: %s is not a valid CIDR',
            name,
            cidr
          )
        );
      }
    });
  });
}

function validateSubnetRoutes(config) {
  Object.keys(config.network.subnets).forEach(function(name){
    Object.keys(config.network.subnets[name].routes).forEach(function(cidr){
      try {
        Addr(cidr);
      } catch (e) {
        throw new Error(
          util.format(
            'network.subnets[%s].routes: %s is not a valid CIDR',
            name,
            cidr
          )
        );
      }
    });
  });
}

function subnetAllocator(cidr) {
  try {
    var next = Addr(cidr, 24);

    return function() {
      var current = next;

      try {
        next = Addr(current.broadcast().increment().toInt(), 24);
      } catch (e) {
        // Silently stall
      }

      return current.toString();
    };
  } catch (e) {
    return subnetAllocator('0.0.0.0');
  }
}

function validateSchema(config) {
  validate(
    config.network,
    schema,
    {propertyName: 'network', throwError: true}
  );
}

module.exports.sanitize = sanitize;
