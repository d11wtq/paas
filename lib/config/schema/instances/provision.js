/**
 * JSON Schema for config.instances.provision.
 */
module.exports = {
  type: 'object',
  properties: {
    user: {type: 'string'},
    script: {type: 'string'},
  },
  additionalProperties: false,
  required: ['script']
};
