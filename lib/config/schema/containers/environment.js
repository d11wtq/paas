/**
 * JSON Schema for config.containers[name].environment.
 */
module.exports = {
  type: 'object',
  additionalProperties: {
    type: [
      'null',
      'number',
      'string',
      'boolean'
    ]
  }
};
