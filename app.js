var express = require('express')
  , bodyParser = require('body-parser')
  , YAML = require('yamljs')
  , deploy = require('./lib/aws/cloudformation/deploy')
  , remove = require('./lib/aws/cloudformation/remove')
  ;

var app = express();

/*! Handle YAML in request bodies */
app.use(bodyParser.text({type: 'text/yaml'}));

/**
 * Create or update :stack with the posted deploy.yml.
 */
app.put('/deployments/:stack', function(req, res){
  req.setTimeout(7200000);

  if (req.headers['content-type'] == 'text/yaml') {
    var deployment = deploy(req.params.stack, YAML.parse(req.body));

    res.status(202).type('plain');
    deployment.on('log', res.write.bind(res));
    deployment.on('end', res.end.bind(res));
  } else {
    res.status(400).send('Unsupported content-type');
  }
});

/**
 * Delete :stack, if it exists.
 */
app.delete('/deployments/:stack', function(req, res){
  req.setTimeout(7200000);

  var removal = remove(req.params.stack);

  res.status(202).type('plain');
  removal.on('log', res.write.bind(res));
  removal.on('end', res.end.bind(res));
});

/*! Run express server */
var server = app.listen(3000, function(){
  var host = server.address().address
    , port = server.address().port
    ;

  console.log(
    'PaaS listening on http://%s:%s',
    host,
    port
  );
});
