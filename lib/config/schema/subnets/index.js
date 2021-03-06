/**
 * JSON Schema for config.subnets.
 */
module.exports = {
  type: 'object',
  additionalProperties: {
    type: 'array',
    items: {
      type: 'string',
      pattern: '^subnet-[a-z0-9]+$'
    },
    minItems: 1,
  },
  minProperties: 1,
};
