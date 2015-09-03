/**
 * JSON Schema for config.database.
 */
module.exports = {
  type: 'object',
  properties: {
    'subnet': require('./subnet'),
    'type': require('./type'),
    'engine': require('./engine'),
    'master': require('./master'),
    'parameters': require('./parameters'),
    'port': require('./port'),
    'disk-size': require('./disk-size'),
    'username': require('./username'),
    'password': require('./password'),
    'domain': require('./domain'),
  },
  required: [
    'subnet',
    'type',
    'engine',
    'port',
    'disk-size',
  ],
  additionalProperties: false,
};
