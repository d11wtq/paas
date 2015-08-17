#!/usr/bin/env node

var AWS = require('aws-sdk')
  , util = require('util')
  , _ = require('lodash')
  , path = require('path')
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
  , filters = {
    docker: {
      owner: '186644023806',
      image: /^ubuntu-.*-docker-.*/
    },
    nat: {
      owner: 'amazon',
      image: /^amzn-ami-vpc-nat-.*-gp2/
    },
  },
  filter = (filters[process.argv[2]] || usage(1))
  ;

function usage(code) {
  console.log(
    'Usage: %s "docker" | "nat"',
    path.basename(process.argv[1])
  );
  process.exit(code || 0);
}

function latest(images) {
  return images
    .filter(function(img){
      return filter.image.test(img.Name);
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
            'Name': 'architecture',
            'Values': ['x86_64']
          },
        ],
        Owners: [filter.owner]
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
