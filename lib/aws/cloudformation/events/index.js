var util = require('util')
  , EventEmitter = require('events').EventEmitter
  ;

/**
 * Fetches stack events for a CloudFormation stack.
 *
 * @constructor
 *
 * @extends {events.EventEmitter}
 *
 * @param {Function} service
 *   AWS service factory
 *
 * @param {String} name
 *   the name of the CloudFormation stack to target
 */
function StackEvents(service, name) {
  var self = this
    , CF = service('CloudFormation')
    , seen = {}
    , stop = false
    , wait = 3000
    ;

  /**
   * Fetch stack events and emit as 'log' events.
   *
   * @param {String} nextToken
   *   internal use only
   */
  this.perform = function(nextToken) {
    var results = [];

    CF.describeStackEvents(
      {StackName: name, NextToken: nextToken},
      function(err, res){
        if (err) {
          if (err.retryable) {
            setTimeout(page(nextToken), wait);
          } else {
            self.end();
          }
        } else {
          prime(res.StackEvents);

          Array.prototype.push.apply(
            results,
            res.StackEvents
          );

          if (res.NextToken && !someSeen(results)) {
            setImmediate(page(nextToken));
          } else {
            results.filter(unseen).reverse().forEach(self.evt);

            if (stop) {
              self.end();
            } else {
              updateStopSignal(function(){
                setTimeout(page(), wait);
              });
            }
          }
        }
      }
    );
  };

  function prime(events) {
    if (Object.keys(seen).length == 0) {
      events.forEach(function(evt){
        if (Object.keys(seen).length > 0) {
          seen[evt.EventId] = evt;
        } else {
          if (isUpdated(evt.ResourceStatus)) {
            switch (name) {
              case evt.LogicalResourceId:
              case evt.PhysicalResourceId:
                seen[evt.EventId] = evt;
            }
          }
        }
      });
    }
  }

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
    name = evt.StackId; // canonicalize to StackId
    seen[evt.EventId] = evt;
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

  function page(nextToken) {
    return function(){
      self.perform(nextToken);
    };
  }

  function unseen(evt) {
    return ! (evt.EventId in seen);
  }

  function someSeen(results) {
    return results.some(function(evt){
      return !unseen(evt);
    });
  }

  function updateStopSignal(done) {
    if (stop) {
      done();
    } else {
      CF.describeStacks(
        {StackName: name},
        function(err, res){
          stop |= (!err && isUpdated(res.Stacks[0].StackStatus));
          done();
        }
      );
    }
  }

  function isUpdated(state) {
    return /_(COMPLETE|FAILED)$/.test(state);
  }

  function description(evt) {
    return util.format(
      '%s %s [%s] %s',
      evt.Timestamp.toISOString(),
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
 * @param {Function} service
 *   AWS service factory
 *
 * @param {String} name
 *   the name of the target CloudFormation stack
 *
 * @return {StackEvents}
 *   an EventEmitter logging stack events
 */
function events(service, name) {
  var eventStream = new StackEvents(service, name);
  eventStream.perform();
  return eventStream;
}

module.exports = events;
