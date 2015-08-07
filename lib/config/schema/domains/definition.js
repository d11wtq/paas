var ttlSchema = require('./ttl')
  , recordsSchema = require('./records')
  , aliasSchema = require('./alias')
  ;

/**
 * JSON Schema for config.domains[name][type].
 */
module.exports = {
  type: 'object',
  properties: {
    ttl: ttlSchema,
    records: recordsSchema,
    alias: aliasSchema,
  },
  additionalProperties: false,
};
