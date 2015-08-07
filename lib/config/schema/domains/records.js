/**
 * JSON Schema for config.domains[name][type].records.
 */
module.exports = {
  type: 'array',
  items: {
    type: 'string'
  },
  minItems: 1,
};
