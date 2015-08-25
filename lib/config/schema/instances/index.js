/**
 * JSON schema for config.instances.
 */
module.exports = {
  type: 'object',
  properties: {
    type: require('../instance-type'),
    ami: require('../ami-id'),
    scale: require('./scale'),
    traffic: require('./traffic'),
    subnet: require('./subnet'),
    ssh: require('./ssh'),
    ports: require('./ports'),
    provision: require('./provision')
  },
  additionalProperties: false,
  required: [
    'type',
    'ami',
    'scale',
    'traffic',
    'subnet',
    'ports'
  ],
};
