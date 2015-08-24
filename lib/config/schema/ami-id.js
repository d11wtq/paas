/**
 * JSON Schema for EC2 AMI ID.
 */
module.exports = {
  type: 'string',
  pattern: '^ami-[a-z0-9]+$'
};
