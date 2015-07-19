function build(config) {
  return {
    'AWSTemplateFormatVersion': '2010-09-09',
    'Description': config.description,
    'Resources': {
      'InstanceSecurityGroup': {
        'Type': 'AWS::EC2::SecurityGroup',
        'Properties': {
        }
      }
    }
  };
}

module.exports.build = build;
