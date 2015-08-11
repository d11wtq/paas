/**
 * JSON Schema for config['load-balancer'].ports.
 */
module.exports = {
  type: 'object',
  patternProperties: {
    '^[0-9]+(/(tcp|ssl|http|https))?$': {
      type: ['string', 'integer'],
      pattern: '^[0-9]+(/(tcp|ssl|http|https))?$',
      minimum: 0,
      maximum: 65535
    }
  },
  additionalProperties: false,
};
