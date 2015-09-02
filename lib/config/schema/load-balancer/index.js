/**
 * JSON Schema for config['load-balancer'].
 */
module.exports = {
  type: 'object',
  properties: {
    subnet: require('./subnet'),
    ports: require('./ports'),
    timeout: require('./timeout'),
    certificate: require('./certificate'),
    domain: require('./domain'),
  },
  required: ['subnet', 'ports'],
  additionalProperties: false,
};
