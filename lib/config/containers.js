var validate = require('jsonschema').validate
  , schema = require('./schema/containers')
  ;

/*! Sub-sanitization for the 'containers' key. */
function sanitize(config) {
  if (!config.containers) {
    return config;
  } else {
    // TODO: Validate:
    //   - image format
    //   - container name format
    //   - link names refer to containers
    //   - ports are bound only once
    validate(
      config.containers,
      schema,
      {
        propertyName: 'containers',
        throwError: true
      }
    );

    return config;
  }
}

module.exports.sanitize = sanitize;
