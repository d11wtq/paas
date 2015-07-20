function build(config) {
  return {
    'AWSTemplateFormatVersion': '2010-09-09',
    'Description': config.description,
    'Resources': {
      'InstanceSecurityGroup': {
        'Type': 'AWS::EC2::SecurityGroup',
        'Properties': {
          'GroupDescription': {
            'Fn::Join': [
              '/',
              [
                {'Ref': 'AWS::StackName'},
                'InstanceSecurityGroup'
              ]
            ]
          },
          'Tags': [
            {
              'Key': 'Name',
              'Value': {
                'Fn::Join': [
                  '/',
                  [
                    {'Ref': 'AWS::StackName'},
                    'InstanceSecurityGroup'
                  ]
                ]
              }
            }
          ]
        }
      }
    }
  };
}

module.exports.build = build;
