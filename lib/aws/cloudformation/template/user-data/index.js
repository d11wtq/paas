var script = require('./script')
  , docker = require('./docker')
  ;

/**
 * Build a script to provision instances for this config.
 *
 * @param {Object} config
 *   the parsed YAML config
 *
 * @return {Object}
 *   a CloudFormation template structure
 */
function build(config) {
  return {
    'Fn::Join': [
      '\n\n',
      [
        '#!/bin/sh',
        'exec >> /var/log/user-data.log 2>&1',
        script.build(config),
        docker.build(config),
      ]
    ]
  };
}

module.exports.build = build;
