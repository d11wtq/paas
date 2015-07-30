var validate = require('jsonschema').validate
  , schema = require('./schema/containers')
  , util = require('util')
  ;

/*! Sub-sanitization for the 'containers' key */
function sanitize(config) {
  if (!config.containers) {
    return config;
  } else {
    try {
      validate(
        config.containers,
        schema,
        {
          propertyName: 'containers',
          throwError: true
        }
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

    return config;
  }
}

module.exports.sanitize = sanitize;
