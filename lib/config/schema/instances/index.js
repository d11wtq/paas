var typeSchema = require('./type')
  , amiSchema = require('./ami')
  , scaleSchema = require('./scale')
  , trafficSchema = require('./traffic')
  , subnetSchema = require('./subnet')
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
    traffic: trafficSchema,
    subnet: subnetSchema,
  },
  additionalProperties: false,
  required: [
    'type',
    'ami',
    'scale',
    'traffic',
    'subnet'
  ],
};
