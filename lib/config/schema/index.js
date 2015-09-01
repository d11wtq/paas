/**
 * JSON Schema for config.
 */
module.exports = {
  type: 'object',
  properties: {
    'description': require('./description'),
    'depends': require('./depends'),
    'vpc': require('./vpc'),
    'subnets': require('./subnets'),
    'containers': require('./containers'),
    'instances': require('./instances'),
    'load-balancer': require('./load-balancer'),
    'monitoring': require('./monitoring'),
    'zone': require('./zone'),
    'domains': require('./domains'),
    'network': require('./network'),
    'database': require('./database'),
  },
  additionalProperties: false,
};
