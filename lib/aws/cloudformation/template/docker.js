var toposort = require('toposort')
  , _ = require('lodash')
  , util = require('util')
  , path = require('path')
  ;

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
      '\n\n',
      [
        '#!/bin/sh',
        'exec >> /dev/console 2>&1',
        {
          'Fn::Join': [
            '\n\n',
            prepare(config)
          ]
        },
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
 * Build a list of all file generators etc needed for the commands to work.
 */
function prepare(config) {
  return containerNames(config.containers)
    .map(function(name){
      var container = _.extend(Object(), config.containers[name], {name: name});

      return {
        'Fn::Join': [
          '\n\n',
          prepareEnv(container),
        ]
      };
    });
}

function prepareEnv(container) {
  return Object.keys(container.environment || Object()).map(function(key){
    return {
      'Fn::Join': [
        '\n',
        [
          util.format(
            'mkdir -p %s',
            path.dirname(envPath(container, key))
          ),
          util.format(
            "cat > %s <<'EOFNpGw1BpWL134bP5HtHBL15GTqV9r'",
            envPath(container, key)
          ),
          (container.environment[key] || ''),
          'EOFNpGw1BpWL134bP5HtHBL15GTqV9r'
        ]
      ]
    };
  });
}

/**
 * Build a list of all `docker run' commands in order.
 */
function commands(config) {
  return containerNames(config.containers)
    .map(function(name){
      var container = _.extend(Object(), config.containers[name], {name: name})
        , lineBreak = '\\\n   '
        ;

      return {
        'Fn::Join': [
          lineBreak,
          [
            'docker run',
            '--detach',
            {'Fn::Join': [' ', ['--name', container.name]]},
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
  var dependencies = Object.keys(containers || Object())
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
    return {
      'Fn::Join': [
        ' ',
        [
          '--env',
          envFlag(container, key)
        ]
      ]
    };
  });
}

/**
 * Get the path to the environment variable data for the given container.
 */
function envPath(container, key) {
  return util.format(
    '/etc/user-data/containers/%s/env/%s.txt',
    container.name,
    key
  );
}

/**
 * Get the value to place after --env.
 */
function envFlag(container, key) {
  var value = container.environment[key];
  if (value == null) {
    return key;
  } else {
    return {
      'Fn::Join': [
        '=',
        [
          key,
          util.format(
            '"$(cat %s)"',
            envPath(container, key)
          )
        ]
      ]
    };
  }
}

module.exports.script = script;
