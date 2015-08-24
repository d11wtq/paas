/**
 * JSON Schema for config.network.subnets.
 */
module.exports = {
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      cidrs: require('./cidrs'),
      public: require('./public'),
      routes: require('./routes'),
    },
    additionalProperties: false,
    required: ['cidrs', 'routes']
  },
  minProperties: 1,
};
