/**
 * JSON Schema for config.monitoring.threshold.
 */
module.exports = {
  type: 'object',
  properties: {
    up: {
      type: 'integer',
      minimum: 1,
    },
    down: {
      type: 'integer',
      minimum: 1,
    },
  },
  additionalProperties: false,
  required: ['up', 'down'],
};
