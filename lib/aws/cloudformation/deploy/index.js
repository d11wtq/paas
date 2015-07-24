var util = require('util')
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
      var asgResource = template.AutoScalingGroup.key(config)
        , asgCreating = false
        ;

      if (err) {
        self.log(err);
        self.end();
      } else {
        concurrently(events(res.StackId))
          .on('evt', function(evt){
            if (evt.LogicalResourceId != asgResource) {
              return;
            }

            if (evt.PhysicalResourceId) {
              if (!asgCreating) {
                asgCreating = true;
                concurrently(monitor(evt.PhysicalResourceId))
                  .on('transition', signalAsg);
              }
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
    var req = {
      StackName: name,
      TemplateBody: JSON.stringify(template.build(config)),
      Capabilities: ["CAPABILITY_IAM"]
    };

    Object.keys(params || Object())
      .forEach(function(k){
        req[k] = params[k];
      });

    return req;
  }

  function apply(done) {
    CF.createStack(payload({OnFailure: 'DELETE'}), function(err, res){
      if (err) {
        switch (err.code) {
          case 'AlreadyExistsException':
            CF.updateStack(payload(), function(err, res){
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

  function signalAsg(state) {
    if (state.State == 'IN_SERVICE') {
      var req = {
        StackName: name,
        LogicalResourceId: template.AutoScalingGroup.key(config),
        UniqueId: state.InstanceId,
        Status: 'SUCCESS'
      };

      CF.signalResource(req, function(err){
        if (err && err.retryable) {
          setTimeout(function(){ signalAsg(state) }, wait);
        }
      });
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
