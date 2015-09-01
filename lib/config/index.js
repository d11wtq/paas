var validate = require('jsonschema').validate
  , schema = require('./schema')
  , _ = require('lodash')
  , AWS = require('aws-sdk')
  ;

function fireAt(f, n) {
  var fired = false;

  return function(err, data) {
    if (!fired) {
      if (err || (--n == 0)) {
        fired = true;
        f(err, data);
      }
    }
  };
}

/**
 * Check and merge all 'depends' keys in config.
 *
 * @param {Object} config
 *   unsanitized parsed YAML config file
 *
 * @param {Function} done
 *   a callback receiving (err, data)
 *   - err: an Error object, should resolution fail
 *   - data: unsanitized parsed YAML config with 'depends' resolved
 */
function resolve(config, done) {
  // FIXME: This does not belong here
  if (config && Array.isArray(config.depends) && config.depends.length > 0) {
    var trigger = fireAt(done, config.depends.length)
      , CF = new AWS.CloudFormation()
      ;

    config.depends.forEach(function(name){
      CF.describeStacks({StackName: name}, function(err, res){
        if (err) {
          trigger(err);
        } else {
          var output = res.Stacks[0].Outputs.filter(function(o){
            return o.OutputKey == 'HirdConfig';
          })[0];

          if (output) {
            try {
              trigger(
                undefined,
                config = _.extend(JSON.parse(output.OutputValue), config)
              );
            } catch (e) {
              trigger(e);
            }
          } else {
            trigger(undefined, config);
          }
        }
      });
    });
  } else {
    done(undefined, config);
  }
};

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
  var normalizedConfig = [
    require('./depends'),
    require('./network'),
    require('./subnets'),
    require('./containers'),
    require('./instances'),
    require('./load-balancer'),
    require('./monitoring'),
    require('./domains'),
    require('./database'),
  ].reduce(
    function(config, sanitizer){
      return sanitizer.sanitize(config);
    },
    config
  );

  validateSchema(normalizedConfig);

  return normalizedConfig;
}

function validateSchema(config) {
  validate(
    config,
    schema,
    {propertyName: 'config', throwError: true}
  );
}

module.exports.resolve = resolve;
module.exports.sanitize = sanitize;
