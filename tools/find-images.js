#!/usr/bin/env node

var AWS = require('aws-sdk')
  , util = require('util')
  , _ = require('lodash')
  , regions = [
    'us-east-1',
    'us-west-1',
    'us-west-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'sa-east-1',
    'eu-west-1',
    'eu-central-1'
  ]
  ;

function latest(images) {
  return images
    .filter(function(img){
      return !/\.rc-/.test(img.Name);
    })
    .sort(function(a, b){
      return b.Name.localeCompare(a.Name);
    })[0];
}

(function reduceRegions(acc, queue){
  if (queue.length == 0) {
    console.log(acc);
  } else {
    var region = queue[0]
      , EC2 = new AWS.EC2({region: region})
      ;

    EC2.describeImages(
      {
        Filters: [
          {
            'Name': 'virtualization-type',
            'Values': ['hvm']
          },
          {
            'Name': 'root-device-type',
            'Values': ['ebs']
          },
          {
            'Name': 'state',
            'Values': ['available']
          },
          {
            'Name': 'name',
            'Values': ['amzn-ami-hvm-*.x86_64-gp2']
          },
        ],
        Owners: ['amazon']
      },
      function(err, res){
        if (err) {
          console.log(util.format('ERR: %s', region));
          console.log(err);
        } else {
          var image = latest(res.Images);

          console.log(util.format('---> %s', region));
          console.log(util.format('     %s', image.Name));

          setImmediate(
            function(){
              reduceRegions(
                _.set(acc, [region], image.ImageId),
                queue.slice(1)
              )
            }
          );
        }
      }
    );
  }
})(Object(), regions);
