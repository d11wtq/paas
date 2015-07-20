var util = require('util')
  , AWS = require('aws-sdk')
  , EventEmitter = require('events').EventEmitter
  , template = require('../template')
  , events = require('../events')
  ;

/**
 * Performs a deployment to AWS via CloudFormation.
 *
 * @constructor
 *
 * @extends {events.EventEmitter}
 *
 * @param {AWS.CloudFormation} CF
 *   the CloudFormation client
 *
 * @param {String} name
 *   the name of the CloudFormation stack to target
 *
 * @param {Object} config
 *   the parsed YAML config file
 */
function Deployment(CF, name, config) {
  var self = this;

  /**
   * Start the deployment.
   */
  this.perform = function() {
    apply(function(err, res){
      if (err) {
        self.log(err);
        self.end();
      } else {
        var eventStream = events(res.StackId);
        eventStream.on('log', self.log);
        eventStream.on('end', self.end);
      }
    });
  };

  /**
   * Emit a 'log' event, making sure to append a newline.
   */
  this.log = function(msg) {
    self.emit('log', msg.toString().trim() + '\n');
  };

  /**
   * Emit the 'end' event.
   */
  this.end = function() {
    self.emit('end');
  };

  // -- Private

  function apply(done) {
    var req = {
      StackName: name,
      TemplateBody: JSON.stringify(template.build(config)),
      Capabilities: ["CAPABILITY_IAM"]
    };

    CF.createStack(req, function(err, res){
      if (err) {
        switch (err.code) {
          case 'AlreadyExistsException':
            CF.updateStack(req, function(err, res){
              if (err) {
                done(err);
              } else {
                done(undefined, res);
              }
            });
            break;

          default:
            done(err);
        }
      } else {
        done(undefined, res);
      }
    });
  }
}

util.inherits(Deployment, EventEmitter);

/**
 * Perform a new deployment for stack {name} with YAML {config}.
 *
 * @param {String} name
 *   the name of the cloudformation stack to target
 *
 * @param {Object} config
 *   the parsed YAML config file
 *
 * @return {Deployment}
 *   an EventEmitter for the deployment
 */
function deploy(name, config) {
  var deployment = new Deployment(
    new AWS.CloudFormation(),
    name,
    config
  );
  deployment.perform();
  return deployment;
}

module.exports = deploy;
