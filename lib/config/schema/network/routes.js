/**
 * JSON Schema for config.network.subnets[name].routes.
 */
module.exports = {
  type: 'object',
  patternProperties: {
    '^[0-9]+(\\.[0-9]+){3}/[0-9]+$': {
      enum: ['nat', 'internet'],
    }
  },
  additionalProperties: false,
  minProperties: 1,
};
