function build(config) {
  /**
   * InstanceSecurityGroup
   * LoadBalancerSecurityGroup
   * AutoScalingGroup{Version}
   * LaunchConfiguration
   * LoadBalancerDnsRecord
   */
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
          'SecurityGroupIngress': instanceIngress(config),
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

function instanceIngress(config) {
  return Object.keys(config.containers)
    .map(function(k){
      return config.containers[k];
    })
    .map(function(c){
      return Object.keys(c.ports || Object())
        .map(function(n){
          return {
            'IpProtocol': 'tcp',
            'CidrIp': '0.0.0.0/0',
            'FromPort': n,
            'ToPort': n
          };
        });
    }).reduce(function(a, b){
      return a.concat(b);
    });
}

module.exports.build = build;
