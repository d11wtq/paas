/**
 * JSON Schema for config.network.subnets[name].cidrs.
 */
module.exports = {
  type: 'array',
  items: require('./cidr'),
  minItems: 1,
};
