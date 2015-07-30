var validate = require('jsonschema').validate
  , schema = require('./schema/containers')
  , util = require('util')
  ;

/*! Sub-sanitization for the 'containers' key */
function sanitize(config) {
  if (!config.containers) {
    return config;
  } else {
    [
      validateSchema,
      validateLinks
    ].forEach(function(f){ f(config) });
    return config;
  }
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
          '%s[%s] is not a valid container name',
          e.property,
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

module.exports.sanitize = sanitize;
