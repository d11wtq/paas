/**
 * JSON schema for config.instances.
 */
module.exports = {
  type: 'object',
  properties: {
    type: require('./type'),
    ami: require('./ami'),
    scale: require('./scale'),
    traffic: require('./traffic'),
    subnet: require('./subnet'),
    ssh: require('./ssh'),
  },
  additionalProperties: false,
  required: [
    'type',
    'ami',
    'scale',
    'traffic',
    'subnet'
  ],
};
