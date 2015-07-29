/**
 * JSON Schema for config.containers[name].ports.
 */
module.exports = {
  type: 'object',
  patternProperties: {
    '^[0-9]+$': {
      type: 'integer'
    }
  },
  additionalProperties: false
};
