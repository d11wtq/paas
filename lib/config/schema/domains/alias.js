/**
 * JSON Schema for config.domains[name][type].alias.
 */
module.exports = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    zone_id: {
      type: 'string',
      pattern: '^Z[A-Z0-9]+$'
    },
  },
  additionalProperties: false,
  required: ['name'],
};
