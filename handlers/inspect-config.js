var util = require('util')
  , YAML = require('yamljs')
  , config = require('../lib/config')
  ;

module.exports = function(req, res){
  config.fetch(req, function(err, data){
    if (err) {
      res.status(400)
        .type('plain')
        .send(util.format('%s\n', err.toString()));
    } else {
      res.status(200)
        .type('plain')
        .send(YAML.stringify(data, null, 2));
    }
  });
};
