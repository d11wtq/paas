var util = require('util')
  , AWS = require('aws-sdk')
  , EventEmitter = require('events').EventEmitter
  ;

/**
 * Fetches stack events for a CloudFormation stack.
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
 */
function StackEvents(CF, name) {
  var self = this
    , seen = {}
    , stop = false
    , wait = 1000
    ;

  /**
   * Fetch stack events and emit as 'log' events.
   *
   * @param {Boolean} stop
   *   internal use only
   */
  this.perform = function() {
    var results = [];

    function next(nextToken) {
      return function(){ scroll(nextToken) };
    }

    // recursively pages through results
    function scroll(nextToken) {
      var req = {
        StackName: name,
        NextToken: nextToken
      };

      CF.describeStackEvents(req, function(err, res){
        if (err) {
          return setTimeout(next(nextToken), wait);
        }

        res.StackEvents.forEach(function(evt){
          if (!(evt.EventId in seen)) {
            results.push(evt);
          }
        });

        if (res.NextToken) {
          setImmediate(next(res.NextToken));
        } else {
          results.reverse().forEach(function(evt){
            seen[evt.EventId] = true;
            self.evt(evt);
          });

          if (stop) {
            self.end();
          } else {
            checkFinished(function(){
              setTimeout(
                self.perform,
                wait
              );
            });
          }
        }
      });
    }

    scroll();
  };

  /**
   * Set the stop flag to cease processing further events.
   */
  this.stop = function(){
    stop = true;
  };

  /**
   * Emit a 'log' event, taking care to add a newline.
   */
  this.log = function(msg) {
    self.emit('log', msg.toString().trim() + '\n');
  };

  /**
   * Emit an 'evt' event, passing the raw event info.
   */
  this.evt = function(evt) {
    self.emit('evt', evt);
    self.log(description(evt));
  };

  /**
   * Emit the 'end' event.
   */
  this.end = function() {
    self.emit('end');
  };

  // -- Private

  function checkFinished(done) {
    if (stop) {
      done();
    } else {
      var req = {StackName: name};
      CF.describeStacks(req, function(err, res){
        if (err) {
          done();
        } else {
          var stack = res.Stacks[0];
          stop = stop || isFinished(stack.StackStatus);
          done();
        }
      });
    }
  }

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

/**
 * Fetch stack events for stack {name}.
 *
 * @param {String} name
 *   the name of the target CloudFormation stack
 *
 * @return {StackEvents}
 *   an EventEmitter logging stack events
 */
function events(name) {
  var eventStream = new StackEvents(
    new AWS.CloudFormation(),
    name
  );
  eventStream.perform();
  return eventStream;
}

module.exports = events;
