/**
 * JSON Schema for config['load-balancer'].domain.
 */
module.exports = {
  type: 'object',
  properties: {
    zone: {type: 'string'},
    name: {type: 'string'},
  },
  required: ['zone', 'name'],
  additionalProperties: false,
};
