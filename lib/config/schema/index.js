var descriptionSchema = require('./description')
  , containersSchema = require('./containers')
  , instancesSchema = require('./instances')
  , loadBalancerSchema = require('./load-balancer')
  , monitoringSchema = require('./monitoring')
  , vpcSchema = require('./vpc')
  , subnetsSchema = require('./subnets')
  , zoneSchema = require('./zone')
  , domainsSchema = require('./domains')
  ;

/**
 * JSON Schema for config.
 */
module.exports = {
  type: 'object',
  properties: {
    'description': descriptionSchema,
    'vpc': vpcSchema,
    'subnets': subnetsSchema,
    'containers': containersSchema,
    'instances': instancesSchema,
    'load-balancer': loadBalancerSchema,
    'monitoring': monitoringSchema,
    'zone': zoneSchema,
    'domains': domainsSchema,
  },
  additionalProperties: false,
};
