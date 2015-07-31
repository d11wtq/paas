var containers = require('./containers')
  , instances = require('./instances')
  ;

/**
 * Return a sanitized version of the input config.
 *
 * This adds default values where they need to be added and validates that the
 * input values are correct.
 *
 * @throws {Error}
 *   in the case the input is not valid
 *
 * @param {Object} config
 *   unsanitized parsed YAML config file
 *
 * @return {Object}
 *   sanitized YAML config file
 */
function sanitize(config) {
  return [containers, instances].reduce(
    function(config, sanitizer){
      return sanitizer.sanitize(config);
    },
    config
  );
}

module.exports.sanitize = sanitize;
