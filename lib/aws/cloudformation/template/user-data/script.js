var _ = require('lodash')
  , util = require('util')
  ;

/**
 * Wrap any provided user-data with a script.
 *
 * @param {Object} config
 *   the parsed YAML config
 *
 * @return {Object}
 *   a CloudFormation template structure
 */
function build(config) {
  if (config.instances.provision) {
    if (config.instances.provision.user) {
      return {
        'Fn::Join': [
          '\n',
          [
            util.format(
              "su %s - <<'PROVISION_SCRIPT'",
              config.instances.provision.user
            ),
            config.instances.provision.script,
            'PROVISION_SCRIPT'
          ]
        ]
      };
    } else {
      return config.instances.provision.script;
    }
  } else {
    return '';
  }
}

module.exports.build = build;
