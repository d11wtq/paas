/**
 * JSON Schema for config.database.type.
 */
module.exports = {
  enum: [
    'db.t1.micro',
    'db.m1.small',

    'db.m3.medium',
    'db.m3.large',
    'db.m3.xlarge',
    'db.m3.2xlarge',

    'db.r3.large',
    'db.r3.xlarge',
    'db.r3.2xlarge',
    'db.r3.4xlarge',
    'db.r3.8xlarge',

    'db.t2.micro',
    'db.t2.small',
    'db.t2.medium',

    'db.m2.xlarge',
    'db.m2.2xlarge',
    'db.m2.4xlarge',
    'db.cr1.8xlarge',

    'db.m1.medium',
    'db.m1.large',
    'db.m1.xlarge',
  ]
};
