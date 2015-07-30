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
  patternProperties: {
    '^[a-zA-Z0-9][a-zA-Z0-9_.-]*$': {
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
  },
  additionalProperties: false
};
