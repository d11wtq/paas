var express = require('express')
  , bodyParser = require('body-parser')
  , YAML = require('yamljs')
  , deploy = require('./lib/aws/cloudformation/deploy')
  ;

var app = express()
  , timeout = 7200000
  ;

app.use(bodyParser.text({type: 'text/yaml'}));

app.post('/deploy/:name', function(req, res){
  req.setTimeout(timeout);

  if (req.headers['content-type'] == 'text/yaml') {
    var deployment = deploy(
      req.params.name,
      YAML.parse(req.body)
    );

    res.writeHead(202, {'Content-Type': 'text/plain'});

    deployment.on('log', function(msg){
      res.write(msg);
    });

    deployment.on('end', function(){
      res.end();
    });
  } else {
    res.status(400).send('Unsupported content-type');
  }
});

var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
