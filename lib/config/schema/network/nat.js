/**
 * JSON Schema for config.network.nat.
 */
module.exports = {
  type: 'object',
  properties: {
    type: require('../instance-type'),
    ami: require('../ami-id'),
  },
  additionalProperties: false,
  required: ['type', 'ami'],
};
