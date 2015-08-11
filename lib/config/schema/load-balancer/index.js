/**
 * JSON Schema for config['load-balancer'].
 */
module.exports = {
  type: 'object',
  properties: {
    subnet: require('./subnet'),
    ports: require('./ports'),
    domain: require('./domain'),
  },
  required: ['subnet'],
};
