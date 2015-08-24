/**
 * JSON Schema for config.network.cidr.
 */
module.exports = {
  type: 'string',
  pattern: '^[0-9]+(\\.[0-9]+){3}/[0-9]+$'
};
