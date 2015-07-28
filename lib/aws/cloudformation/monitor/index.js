var util = require('util')
  , AWS = require('aws-sdk')
  , EventEmitter = require('events').EventEmitter
  ;

/**
 * Return a closure that fires function f on the nth call.
 *
 * @param {Function} f
 *   the target function to fire
 *
 * @param {Integer} n
 *   the number of times to wait for firing
 *
 * @return {Function}
 *   a closure that does the invocation counting
 */
function fireAt(f, n) {
  return function() {
    if (--n == 0) {
      f();
    }
  };
}

/**
 * Monitor an ASG for changes in instance state.
 *
 * @constructor
 *
 * @extends {events.EventEmitter}
 *
 * @param {AWS.AutoScaling} AS
 *   the AWS AutoScaling client
 *
 * @param {AWS.ELB} ELB
 *   the AWS ELB client
 *
 * @param {String} asgId
 *   the name of the ASG to monitor
 */
function Monitor(AS, ELB, asgId) {
  var self = this
    , wait = 3000
    , stop = false
    , seen = {}
    ;

  /**
   * Start monitoring the ASG for instance health.
   */
  this.perform = function() {
    self.start();
  };

  /**
   * Start monitoring the ASG for instance health.
   */
  this.start = function() {
    if (stop) {
      self.end();
    } else {
      checkAsg(asgId, function(){
        setTimeout(self.start, wait);
      });
    }
  };

  /**
   * Set the stop flag, so no further processing is done.
   */
  this.stop = function() {
    stop = true;
  };

  /**
   * Emit a 'log' event, taking care to add a newline.
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

  /**
   * Transition state for an instance.
   */
  this.transition = function(state) {
    if (seen[state.InstanceId] != state.State) {
      seen[state.InstanceId] = state.State;
      self.emit('transition', state);
      self.log(description(state));
    }
  };

  // -- Private

  function checkAsg(asgId, next) {
    var req = {AutoScalingGroupNames: [asgId]};

    AS.describeAutoScalingGroups(req, function(err, res){
      if (err || res.AutoScalingGroups == []) {
        self.end();
      } else {
        var next_ = fireAt(next, res.AutoScalingGroups.length);

        res.AutoScalingGroups.forEach(function(asg){
          if (asg.LoadBalancerNames == []) { // plain ASG
            asg.Instances.forEach(asgState);
            next_();
          } else { // behind an ELB
            var next__ = fireAt(next_, asg.LoadBalancerNames.length);

            asg.LoadBalancerNames.forEach(function(elbId){
              checkElb(
                elbId,
                asg.Instances.map(function(i){
                  return {InstanceId: i.InstanceId};
                }),
                next__
              );
            });
          }
        });
      }
    });
  }

  function checkElb(elbId, instanceIds, next) {
    if (instanceIds == []) {
      next();
    } else {
      ELB.describeInstanceHealth(
        {LoadBalancerName: elbId, Instances: instanceIds},
        function(err, res){
          if (err) {
            switch (err.code) {
              case 'InvalidInstance':
                next();
                break;

              default:
                self.end();
            }
          } else {
            res.InstanceStates.forEach(elbState);
            next();
          }
        }
      );
    }
  }

  function elbState(instance) {
    if (instance.State == 'Unknown') {
      return;
    }

    var state = (instance.State == 'InService')
      ? 'IN_SERVICE'
      : 'OUT_OF_SERVICE'
      ;

    self.transition({InstanceId: instance.InstanceId, State: state});
  }

  function asgState(instance) {
    var state = (instance.LifecycleState == 'InService')
      ? 'IN_SERVICE'
      : 'OUT_OF_SERVICE'
      ;

    self.transition({InstanceId: instance.InstanceId, State: state});
  }

  function description(state) {
    return util.format(
      '%s %s [%s]',
      new Date(),
      state.InstanceId,
      state.State
    );
  }
}

util.inherits(Monitor, EventEmitter);

/**
 * Monitor an ASG for changes in instance state.
 *
 * @param {String} asgId
 *   the name of the ASG to monitor
 */
function monitor(asgId) {
  var monitor = new Monitor(
    new AWS.AutoScaling(),
    new AWS.ELB(),
    asgId
  );
  monitor.perform();
  return monitor;
}

module.exports = monitor;
