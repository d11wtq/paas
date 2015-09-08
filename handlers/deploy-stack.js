var util = require('util')
  , YAML = require('yamljs')
  , config = require('../lib/config')
  , command = require('../lib/aws/cloudformation/deploy')
  ;

module.exports = function(req, res){
  req.setTimeout(7200000);

  if (req.headers['content-type'] == 'text/yaml') {
    config.resolve(YAML.parse(req.body), function(err, data){
      if (err) {
        res.status(400)
          .type('plain')
          .send(util.format('%s\n', err.toString()));
      } else {
        try {
          var deployment = command(
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
};
