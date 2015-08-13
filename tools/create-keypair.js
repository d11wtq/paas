#!/usr/bin/env node

var AWS = require('aws-sdk')
  , write = require('fs').writeFileSync
  , path = require('path')
  ;

function usage(code) {
  console.log(
    'Usage: %s <name>',
    path.basename(process.argv[1])
  );
  process.exit(code || 0);
}

(function(){
  var EC2 = new AWS.EC2()
    , name = (process.argv[2] || usage(1))
    ;
  EC2.createKeyPair(
    {
      KeyName: path.basename(name),
    },
    function(err, res){
      if (err) {
        console.log(err);
      } else {
        write(name, res.KeyMaterial, {mode: 0600});
        console.log(res);
      }
    }
  );
})();
