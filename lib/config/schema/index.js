var descriptionSchema = require('./description')
  , containersSchema = require('./containers')
  , instancesSchema = require('./instances')
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
    description: descriptionSchema,
    containers: containersSchema,
    instances: instancesSchema,
    monitoring: monitoringSchema,
    vpc: vpcSchema,
    subnets: subnetsSchema,
    zone: zoneSchema,
    domains: domainsSchema,
  },
  additionalProperties: false,
};
