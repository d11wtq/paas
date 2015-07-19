var util = require('util')
  , AWS = require('aws-sdk')
  , EventEmitter = require('events').EventEmitter
  , template = require('../template')
  ;

function Deployment(CF, name, config) {
  var self = this;

  this.perform = function() {
    apply(function(err, res){
      if (err) {
        self.log(err);
        self.end();
      } else {
        var events = new StackEvents(CF, name);
        events.on('log', self.log);
        events.on('end', self.end);
        events.perform();
      }
    });
  };

  this.log = function(msg) {
    self.emit('log', msg.toString().trim() + '\n');
  };

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
                self.log('Stack update in progress');
                done(undefined, res);
              }
            });
            break;

          default:
            done(err);
        }
      } else {
        self.log('Stack creation in progress');
        done(undefined, res);
      }
    });
  }
}

util.inherits(Deployment, EventEmitter);

// FIXME: Error handling
function StackEvents(CF, name) {
  var self = this
    , seen = {}
    , wait = 1000
    ;

  this.perform = function(stop) {
    var result = [];

    function scroll(nextToken) {
      var req = {
        StackName: name,
        NextToken: nextToken
      };

      CF.describeStackEvents(req, function(err, res){
        res.StackEvents.forEach(function(evt){
          if (!(evt.EventId in seen)) {
            result.push(evt);
          }
        });

        if (res.NextToken) {
          setImmediate(function(){
            scroll(res.NextToken);
          });
        } else {
          result.reverse().forEach(function(evt){
            seen[evt.EventId] = true;
            self.log(description(evt));
          });

          if (stop) {
            self.end();
          } else {
            CF.describeStacks({StackName: name}, function(err, res){
              var stack = res.Stacks[0];

              setTimeout(
                self.perform(isFinished(stack.StackStatus)),
                wait
              );
            });
          }
        }
      });
    }

    scroll();
  };

  this.log = function(msg) {
    self.emit('log', msg.toString().trim() + '\n');
  };

  this.end = function() {
    self.emit('end');
  };

  // -- Private

  function isFinished(status) {
    return /_(COMPLETE|FAILED)$/.test(status);
  }

  function description(evt) {
    return util.format(
      '%s %s [%s] %s',
      evt.Timestamp,
      evt.LogicalResourceId,
      evt.ResourceStatus,
      (evt.ResourceStatusReason || '')
    );
  }
}

util.inherits(StackEvents, EventEmitter);

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
