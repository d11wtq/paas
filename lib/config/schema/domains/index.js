var zoneSchema = require('./zone')
  , definitionSchema = require('./definition')
  ;

/**
 * JSON Schema for config.domains.
 */
module.exports = {
  type: 'object',
  properties: {
    zone: zoneSchema
  },
  additionalProperties: {
    type: 'object',
    properties: {
      A: definitionSchema,
      AAAA: definitionSchema,
      CNAME: definitionSchema,
      MX: definitionSchema,
      NS: definitionSchema,
      PTR: definitionSchema,
      SOA: definitionSchema,
      SPF: definitionSchema,
      SRV: definitionSchema,
      TXT: definitionSchema,
    },
    minProperties: 1,
    additionalProperties: false
  }
};
