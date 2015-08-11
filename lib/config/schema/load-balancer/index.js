/**
 * JSON Schema for config['load-balancer'].
 */
module.exports = {
  type: 'object',
  properties: {
    subnet: require('./subnet'),
    domain: require('./domain'),
  },
  required: ['subnet'],
};
