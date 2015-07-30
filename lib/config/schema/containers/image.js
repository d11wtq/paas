var util = require('util');

/*! Hostname */
var HOSTNAME = '[^/]+';

/*! Repository with optional hostname */
var REPOSITORY = util.format(
  '(%s/)?[a-z0-9_]{4,30}',
  HOSTNAME
);

/*! Image with optional repository */
var IMAGE = util.format(
  '(%s/)?[a-z0-9_.-]+',
  REPOSITORY
);

/*! Image with optional tag */
var TAGGED_IMAGE = util.format(
  '%s(:[A-Za-z0-9_.-]{2,30})?',
  IMAGE
);

/**
 * JSON Schema for config.containers[name].image.
 */
module.exports = {
  type: 'string',
  pattern: util.format('^%s$', TAGGED_IMAGE)
};
