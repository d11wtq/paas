/**
 * JSON Schema for config.instances.ports.
 */
module.exports = {
  type: 'array',
  items: {
    type: 'integer',
    minimum: -1,
    maximum: 65535,
  }
};
