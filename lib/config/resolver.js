var _ = require('lodash');

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
 * @param {Function} service
 *   AWS service factory
 *
 * @param {Object} config
 *   unsanitized parsed YAML config file
 *
 * @param {Function} done
 *   a callback to invoke on completion (err, data)
 */
module.exports = function(service, config, done) {
  if (config && Array.isArray(config.depends) && config.depends.length > 0) {
    var trigger = fireAt(done, config.depends.length);

    config.depends.forEach(function(name){
      service('CloudFormation').describeStacks(
        {StackName: name},
        function(err, res){
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
        }
      );
    });
  } else {
    done(undefined, config);
  }
};
