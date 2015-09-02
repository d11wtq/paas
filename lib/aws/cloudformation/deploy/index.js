var util = require('util')
  , _ = require('lodash')
  , AWS = require('aws-sdk')
  , EventEmitter = require('events').EventEmitter
  , template = require('../template')
  , events = require('../events')
  , monitor = require('../monitor')
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
  var self = this
    , todo = 0
    , jobs = []
    ;

  /**
   * Start the deployment.
   */
  this.perform = function() {
    apply(function(err, res){
      var asgApplied = template.AutoScalingGroup.applicable(config)
        , asgCreated = false
        , asgResource = (asgApplied
          ? template.AutoScalingGroup.key(config)
          : undefined)
        ;

      if (err) {
        self.log(err);
        self.end();
      } else {
        concurrently(events(res.StackId))
          .on('evt', function(e){
            if (!asgApplied || asgCreated) {
              return;
            }

            if (e.PhysicalResourceId && e.LogicalResourceId == asgResource) {
              asgCreated = true;
              concurrently(monitor(e.PhysicalResourceId))
                .on('transition', signalAsg);
            }
          });
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

  function payload(params) {
    return _.extend(
      {
        StackName: name,
        TemplateBody: JSON.stringify(template.build(config)),
        Capabilities: ["CAPABILITY_IAM"]
      },
      params
    );
  }

  function apply(done) {
    CF.createStack(payload({OnFailure: 'DELETE'}), function(err, res){
      if (err && err.code == 'AlreadyExistsException') {
        CF.updateStack(payload(), done);
      } else {
        done(err, res);
      }
    });
  }

  function signalAsg(state) {
    if (state.State == 'IN_SERVICE') {
      CF.signalResource(
        {
          StackName: name,
          LogicalResourceId: template.AutoScalingGroup.key(config),
          UniqueId: state.InstanceId,
          Status: 'SUCCESS'
        },
        function(err){
          if (err && err.retryable) {
            setTimeout(function(){ signalAsg(state) }, wait);
          }
        }
      );
    }
  }

  function concurrently(emitter) {
    jobs.push(emitter);
    ++todo;

    emitter.on('log', self.log);
    emitter.on('end', function(){
      jobs.forEach(function(job){ job.stop() });

      if (--todo == 0) {
        self.end();
      }
    });

    return emitter;
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
