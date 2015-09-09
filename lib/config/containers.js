var validate = require('jsonschema').validate
  , schema = require('./schema/containers')
  , util = require('util')
  , _ = require('lodash')
  ;

/*! Sub-sanitization for the 'containers' key */
function sanitize(region, config) {
  if (!config.containers) {
    return config;
  } else {
    [
      validateSchema,
      validateLinks,
      validatePorts
    ].forEach(function(f){ f(config) });
    return config;
  }
}

/**
 * Get all open instance ports for this config.
 *
 * @param {Object} config
 *   parsed YAML config file
 *
 * @return {Array}
 *   an array of integers
 */
function instancePorts(config) {
  return Object.keys(config.containers || Object())
    .map(function(k){
      return config.containers[k];
    })
    .map(function(c){
      return Object.keys(c.ports || Object());
    })
    .reduce(
      function(a, b){
        return a.concat(b);
      },
      []
    ).
    map(function(n){
      return parseInt(n);
    });
}

function validateSchema(config) {
  try {
    validate(
      config.containers,
      schema,
      {propertyName: 'containers', throwError: true}
    );
  } catch (e) {
    if (e.property == 'containers' && e.name == 'additionalProperties') {
      throw new Error(
        util.format(
          'containers[%s] is not a valid container name',
          e.argument
        )
      );
    } else {
      throw e;
    }
  }
}

function validateLinks(config) {
  Object.keys(config.containers).forEach(function(name){
    var container = config.containers[name];

    (container.links || []).forEach(function(link){
      if (!config.containers[link]) {
        throw new Error(
          util.format(
            'containers[%s].links: unknown container "%s"',
            name,
            link
          )
        );
      }
    });
  });
}

function validatePorts(config) {
  Object.keys(config.containers).reduce(
    function(acc, name){
      var container = config.containers[name];
      var ports = container.ports || Object();

      Object.keys(ports).forEach(function(port){
        if (acc[port]) {
          throw new Error(
            util.format(
              'containers[%s].ports: %s already bound',
              name,
              port
            )
          );
        }
      });

      return _.extend(acc, ports);
    },
    Array()
  );
}

module.exports.sanitize = sanitize;
module.exports.instancePorts = instancePorts;
