/**
 * JSON Schema for config['load-balancer'].ports.
 */
module.exports = {
  type: 'object',
  patternProperties: {
    '^[0-9]+$': {
      type: 'integer',
      minimum: 0,
      maximum: 65535,
    }
  },
  additionalProperties: false,
};
