var util = require('util')
  , config = require('../lib/config')
  , aws = require('../lib/aws/service')
  , command = require('../lib/aws/cloudformation/deploy')
  ;

module.exports = function(req, res) {
  req.setTimeout(2 * 60 * 60 * 1000); // 2 hours

  config.fetch(req, function(err, data){
    if (err) {
      res.status(400)
        .type('plain')
        .send(util.format('%s\n', err.toString()));
    } else {
      res.status(202).type('plain');

      command(aws.factory(req), req.params.name, data)
        .on('log', res.write.bind(res))
        .on('end', res.end.bind(res));
    }
  });
};
