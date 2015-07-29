var portsSchema = require('./ports')
  , imageSchema = require('./image')
  , linksSchema = require('./links')
  , environmentSchema = require('./environment')
  ;

/**
 * JSON schema for config.containers.ports.
 */
module.exports = {
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      image: imageSchema,
      ports: portsSchema,
      links: linksSchema,
      environment: environmentSchema,
    },
    additionalProperties: false,
    required: ['image']
  }
};
