var validate = require('jsonschema').validate
  , schema = require('./schema/database')
  , util = require('util')
  , _ = require('lodash')
  ;

/*! Default settings */
function defaults(config) {
  return {
    'subnet': 'private',
    'type': 'db.t2.micro',
    'port': defaultPort(config),
    'disk-size': 5,
    'parameters': {}
  };
}

function defaultPort(config) {
  switch ((config.database.engine || '').toString().split('/')[0]) {
    case 'MySQL':
      return 3306;

    case 'postgres':
      return 5432;

    default:
      return 0;
  }
}

/*! Sub-sanitization for the 'databases' key */
function sanitize(config) {
  if (!config.database) {
    return config;
  } else {
    var normalizedConfig = _.extend(
      Object(),
      config,
      {
        database: _.extend(
          Object(),
          defaults(config),
          (config.database || Object())
        )
      }
    );

    [
      validateSchema,
      validateCredentials,
      validateSubnet,
    ].forEach(function(f){ f(normalizedConfig) });

    return normalizedConfig;
  }
}

function validateSubnet(config) {
  if (!(config.database.subnet in (config.subnets || Object()))) {
    throw new Error(
      util.format(
        'database.subnet: "%s" not defined in subnets %s',
        config.database.subnet,
        Object.keys(config.subnets || Object())
      )
    );
  }
}

function validateCredentials(config) {
  if (! (config.database.master || config.database.snapshot)) {
    ['username', 'password'].forEach(function(key){
      if (!config.database[key]) {
        throw new Error(
          util.format('database requires property "%s" for master', key)
        );
      }
    });
  }
}

function validateSchema(config) {
  validate(
    config.database,
    schema,
    {propertyName: 'database', throwError: true}
  );
}

module.exports.sanitize = sanitize;
