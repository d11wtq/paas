#!/usr/bin/env node

var AWS = require('aws-sdk')
  , read = require('fs').readFileSync
  , path = require('path')
  ;

function certPath(filename) {
  return path.join(
    __dirname,
    '..',
    'certificates',
    filename
  );
}

(function(){
  var IAM = new AWS.IAM();
  IAM.uploadServerCertificate(
    {
      CertificateBody: read(certPath('hird-io.crt'), 'utf8'),
      PrivateKey: read(certPath('hird-io.key'), 'utf8'),
      CertificateChain: read(certPath('DigiCertCA.crt'), 'utf8'),
      ServerCertificateName: 'hird-io',
      Path: '/',
    },
    function(err, res){
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    }
  );
})();
