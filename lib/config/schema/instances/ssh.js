/**
 * JSON Schema for config.instances.ssh.
 */
module.exports = {
  type: 'object',
  properties: {
    key: {type: 'string'},
  },
  additionalProperties: false,
  required: ['key']
};
