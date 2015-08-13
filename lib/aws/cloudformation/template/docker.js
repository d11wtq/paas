var toposort = require('toposort');

/**
 * Build a script the orchestrate `docker run' commands for {config}.
 *
 * @param {Object} config
 *   the parsed YAML config
 *
 * @return {Object}
 *   a CloudFormation template structure
 */
function script(config) {
  return {
    'Fn::Join': [
      '\n',
      [
        '#!/bin/sh',
        'exec >> /dev/console 2>&1',
        {
          'Fn::Join': [
            '\n\n',
            commands(config)
          ]
        }
      ]
    ]
  };
}

/**
 * Build a list of all `docker run' commands in order.
 */
function commands(config) {
  return containerNames(config.containers || Object())
    .map(function(name){
      var container = config.containers[name]
        , lineBreak = '\\\n   '
        ;

      return {
        'Fn::Join': [
          lineBreak,
          [
            'docker run',
            '--detach',
            {'Fn::Join': [' ', ['--name', name]]},
            {
              'Fn::Join': [
                lineBreak,
                links(container)
              ]
            },
            {
              'Fn::Join': [
                lineBreak,
                publish(container)
              ]
            },
            {
              'Fn::Join': [
                lineBreak,
                env(container)
              ]
            },
            container.image
          ]
        ]
      };
    });
}

function containerNames(containers) {
  var dependencies = Object.keys(containers)
    .map(function(name){
      return (containers[name].links || [])
        .map(function(link){
          return [name, link];
        });
    })
    .reduce(
      function(a, b){
        return a.concat(b);
      },
      []
    );

  return toposort
    .array(
      Object.keys(containers),
      dependencies
    ).reverse();
}

/**
 * Build a list of all `--link alias:container' flags.
 */
function links(container) {
  return (container.links || []).map(function(link){
    return {
      'Fn::Join': [
        ' ',
        [
          '--link',
          {'Fn::Join': [':', [link, link]]}
        ]
      ]
    };
  });
}

/**
 * Build a list of all `--publish host:container' flags.
 */
function publish(container) {
  var forwardPorts = container.ports || Object();

  return Object.keys(forwardPorts).map(function(instancePort){
    var containerPort = forwardPorts[instancePort];

    return {
      'Fn::Join': [
        ' ',
        [
          '--publish',
          {'Fn::Join': [':', [instancePort, containerPort]]}
        ]
      ]
    };
  });
}

/**
 * Build a list of all `--env KEY=VALUE' flags.
 */
function env(container) {
  var environment = container.environment || Object();

  return Object.keys(environment).map(function(key){
    var value = environment[key];

    return {
      'Fn::Join': [
        ' ',
        [
          '--env',
          (value == null ? key : {'Fn::Join': ['=', [key, value]]})
        ]
      ]
    };
  });
}

module.exports.script = script;
