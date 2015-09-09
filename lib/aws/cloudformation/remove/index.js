var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , events = require('../events')
  ;

/**
 * Removes a CloudFormation Stack.
 *
 * @constructor
 *
 * @extends {events.EventEmitter}
 *
 * @param {Function} service
 *   AWS service factory
 *
 * @param {String} name
 *   the name of the CloudFormation stack to remove
 */
function Removal(service, name) {
  var self = this
    , CF = service('CloudFormation')
    , todo = 0
    , jobs = []
    ;

  /**
   * Start the removal.
   */
  this.perform = function() {
    CF.deleteStack({StackName: name}, function(err, res){
      if (err) {
        self.log(err);
        self.end();
      } else {
        concurrently(events(service, name));
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

util.inherits(Removal, EventEmitter);

/**
 * Remove CloudFormation stack {name}.
 *
 * @param {Function} service
 *   AWS service factory
 *
 * @param {String} name
 *   the name of the cloudformation stack to remove
 *
 * @return {Removal}
 *   an EventEmitter for the removal
 */
function remove(service, name) {
  var removal = new Removal(service, name);
  removal.perform();
  return removal;
}

module.exports = remove;
