var command = require('../lib/aws/cloudformation/remove')
  , aws = require('../lib/aws/service')
  ;

module.exports = function(req, res){
  req.setTimeout(2 * 60 * 60 * 1000); // 2 hours

  res.status(202).type('plain');

  command(aws.factory(req), req.params.name)
    .on('log', res.write.bind(res))
    .on('end', res.end.bind(res));
};
