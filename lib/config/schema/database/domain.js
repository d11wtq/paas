/**
 * JSON Schema for config.database.domain.
 */
module.exports = {
  type: 'object',
  properties: {
    zone: {type: 'string'},
    name: {type: 'string'},
  },
  required: ['zone', 'name'],
  additionalProperties: false,
};
