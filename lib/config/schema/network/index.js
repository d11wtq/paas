/**
 * JSON schema for config.network.
 */
module.exports = {
  type: 'object',
  properties: {
    cidr: require('./cidr'),
    nat: require('./nat'),
    subnets: require('./subnets'),
  },
  additionalProperties: false,
  required: ['cidr'],
};
