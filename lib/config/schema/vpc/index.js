/**
 * JSON Schema for config.vpc.
 */
module.exports = {
  type: 'string',
  pattern: '^vpc-[a-z0-9]+$',
};
