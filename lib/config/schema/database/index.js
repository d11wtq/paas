/**
 * JSON Schema for config.database.
 */
module.exports = {
  type: 'object',
  properties: {
    'subnet': require('./subnet'),
    'type': require('./type'),
    'engine': require('./engine'),
    'parameters': require('./parameters'),
    'port': require('./port'),
    'disk-size': require('./disk-size'),
    'name': require('./name'),
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
    'username',
    'password',
  ],
  additionalProperties: false,
};
