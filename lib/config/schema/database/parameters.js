/**
 * JSON Schema for config.database.parameters.
 */
module.exports = {
  type: 'object',
  additionalProperties: {
    type: ['string', 'number', 'boolean']
  },
};
