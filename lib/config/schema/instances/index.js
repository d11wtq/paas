var typeSchema = require('./type')
  , amiSchema = require('./ami')
  , scaleSchema = require('./scale')
  ;

/**
 * JSON schema for config.instances.
 */
module.exports = {
  type: 'object',
  properties: {
    type: typeSchema,
    ami: amiSchema,
    scale: scaleSchema,
  },
  additionalProperties: false,
  required: ['type', 'ami', 'scale'],
};
