/**
 * JSON Schema for config.database.engine.
 */
module.exports = {
  type: 'string',
  pattern: '^(MySQL|postgres)/[a-z0-9][a-z0-9.]+$'
};
