var util = require('util')
  , validate = require('jsonschema').validate
  , schema = require('./schema/monitoring')
  , containers = require('./containers')
  , _ = require('lodash')
  ;

/*! Default settings */
function defaults(config) {
  var monitoring = (config.monitoring || Object())
    , timeout = parseInt(monitoring.timeout || 10)
    ;

  return {
    type: 'tcp',
    port: defaultPort(config),
    path: '/',
    timeout: timeout,
    interval: timeout + 5,
    grace: 300,
    threshold: {up: 2, down: 3}
  };
}

/*! Sub-sanitization for the 'monitoring' key */
function sanitize(config) {
  if (!config.containers) {
    return config;
  } else {
    var normalizedConfig = _.extend(
      Object(),
      config,
      {
        monitoring: _.extend(
          Object(),
          defaults(config),
          (config.monitoring || Object())
        )
      }
    );

    [
      validateSchema,
      validateInterval
    ].forEach(function(f){ f(normalizedConfig) });

    return normalizedConfig;
  }
}

function defaultPort(config) {
  var instancePorts = containers.instancePorts(config)
    , firstOpenPort = instancePorts.sort()[0]
    ;

  function port(n) {
    return instancePorts
      .filter(function(m){
        return n == m;
      })[0] || firstOpenPort;
  }

  if (instancePorts == []) {
    return 0;
  } else {
    switch ((config.monitoring || Object()).type) {
      case 'http':
        return port(80);

      case 'https':
        return port(443);

      default:
        return port(0);
    }
  }
}

function validateSchema(config) {
  validate(
    config.monitoring,
    schema,
    {propertyName: 'monitoring', throwError: true}
  );
}

function validateInterval(config) {
  if (config.monitoring.interval <= config.monitoring.timeout) {
    throw new Error(
      util.format(
        'monitoring.interval: must be greater than timeout (%d)',
        config.monitoring.timeout
      )
    );
  }
}

module.exports.sanitize = sanitize;
