var util = require('util')
  , YAML = require('yamljs')
  , config = require('../lib/config')
  , template = require('../lib/aws/cloudformation/template')
  ;

module.exports = function(req, res){
  config.fetch(req, function(err, data){
    if (err) {
      res.status(400)
        .type('plain')
        .send(util.format('%s\n', err.toString()));
    } else {
      res.status(200)
        .type('json')
        .send(JSON.stringify(template.build(data), null, 2));
    }
  });
};
