var express = require('express')
  , bodyParser = require('body-parser')
  , util = require('util')
  , YAML = require('yamljs')
  , config = require('./lib/config')
  , deploy = require('./lib/aws/cloudformation/deploy')
  , remove = require('./lib/aws/cloudformation/remove')
  , template = require('./lib/aws/cloudformation/template')
  ;

var app = express();

/*! Handle YAML in request bodies */
app.use(bodyParser.text({type: 'text/yaml'}));

/**
 * Debug for PUT /stacks/:name.
 */
app.put('/debug/stacks/:name', function(req, res){
  if (req.headers['content-type'] == 'text/yaml') {
    config.resolve(YAML.parse(req.body), function(err, data){
      if (err) {
        res.status(400)
          .type('plain')
          .send(util.format('%s\n', err.toString()));
      } else {
        try {
          var implied = config.sanitize(data);

          res.status(202)
            .type('plain')
            .send(
              util.format(
                [
                  'Stack: %s',
                  '',
                  'Implied Config:',
                  '%s',
                  '',
                  'Template:',
                  '%s'
                ].join('\n'),
                req.params.name,
                YAML.stringify(implied, null, 2),
                JSON.stringify(
                  template.build(implied),
                  null,
                  2
                )
              )
            );
        } catch (e) {
          res.status(400)
            .type('plain')
            .send(util.format('%s\n', e.toString()));
        }
      }
    });
  } else {
    res.status(400)
      .type('plain')
      .send('Unsupported content-type.\n');
  }
});

/**
 * Create or update stack :name with the posted deploy.yml.
 */
app.put('/stacks/:name', function(req, res){
  req.setTimeout(7200000);

  if (req.headers['content-type'] == 'text/yaml') {
    config.resolve(YAML.parse(req.body), function(err, data){
      if (err) {
        res.status(400)
          .type('plain')
          .send(util.format('%s\n', err.toString()));
      } else {
        try {
          var deployment = deploy(
            req.params.name,
            config.sanitize(data)
          );

          res.status(202).type('plain');

          deployment.on('log', res.write.bind(res));
          deployment.on('end', res.end.bind(res));
        } catch (e) {
          res.status(400)
            .type('plain')
            .send(util.format('%s\n', e.toString()));
        }
      }
    });
  } else {
    res.status(400)
      .type('plain')
      .send('Unsupported content-type.\n');
  }
});

/**
 * Delete stack :name if it exists.
 */
app.delete('/stacks/:name', function(req, res){
  req.setTimeout(7200000);

  var removal = remove(req.params.name);

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
    'hird.io listening on http://%s:%s',
    host,
    port
  );
});
