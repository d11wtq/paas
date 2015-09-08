var util = require('util')
  , YAML = require('yamljs')
  , config = require('../lib/config')
  ;

module.exports = function(req, res){
  if (req.headers['content-type'] == 'text/yaml') {
    config.resolve(YAML.parse(req.body), function(err, data){
      if (err) {
        res.status(400)
          .type('plain')
          .send(util.format('%s\n', err.toString()));
      } else {
        try {
          res.status(200)
            .type('json')
            .send(YAML.stringify(config.sanitize(data), null, 2));
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
