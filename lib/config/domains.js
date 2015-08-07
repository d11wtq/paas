var validate = require('jsonschema').validate
  , schema = require('./schema/domains')
  , util = require('util')
  , _ = require('lodash')
  ;

/*! TTL to use if none other set */
var DEFAULT_TTL = 60;

/*! Sub-sanitization for the 'domains' key */
function sanitize(config) {
  if (!config.domains) {
    return config;
  } else {
    [
      validateSchema,
      validateZone
    ].forEach(function(f){ f(config) });

    return _.extend(
      Object(),
      config,
      {domains: sanitizeDomains(config.domains)}
    );
  }
}

function sanitizeDomains(domains) {
  return Object.keys(domains)
    .reduce(
      function(acc, name){
        if (name == 'zone') {
          return _.set(acc, [name], domains[name]);
        } else {
          return _.set(acc, [name], sanitizeDefinitions(name, domains[name]));
        }
      },
      Object()
    );
}

function sanitizeDefinitions(name, definitions) {
  function defaults(type, def) {
    if (!(def.alias || def.records)) {
      throw new Error(
        util.format(
          'domains[%s][%s]: one of [alias, records] is required',
          name,
          type
        )
      );
    }

    if (def.alias && def.records) {
      throw new Error(
        util.format(
          'domains[%s][%s].records: cannot be present with alias',
          name,
          type
        )
      );
    }

    return _.extend(Object(), {ttl: DEFAULT_TTL}, def);
  }

  return Object.keys(definitions)
    .reduce(
      function(acc, type){
        return _.set(
          acc,
          [type],
          defaults(type, definitions[type])
        );
      },
      Object()
    );
}

function validateZone(config) {
  if (!config.zone && !config.domains.zone) {
    throw new Error('domains: one of [domains.zone, zone] is required');
  }
}

function validateSchema(config) {
  validate(
    config.domains,
    schema,
    {propertyName: 'domains', throwError: true}
  );
}

module.exports.sanitize = sanitize;
