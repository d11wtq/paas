var typeSchema = require('./type')
  , portSchema = require('./port')
  , pathSchema = require('./path')
  , timeoutSchema = require('./timeout')
  , intervalSchema = require('./interval')
  , graceSchema = require('./grace')
  , thresholdSchema = require('./threshold')
  ;

/**
 * JSON schema for config.monitoring.
 */
module.exports = {
  type: 'object',
  properties: {
    type: typeSchema,
    port: portSchema,
    path: pathSchema,
    timeout: timeoutSchema,
    interval: intervalSchema,
    grace: graceSchema,
    threshold: thresholdSchema
  },
  additionalProperties: false,
  required: [
    'type',
    'port',
    'path',
    'timeout',
    'interval',
    'grace',
    'threshold',
  ],
};
