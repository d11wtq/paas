var command = require('../lib/aws/cloudformation/remove');

module.exports = function(req, res){
  req.setTimeout(7200000);

  res.status(202).type('plain');

  command(req.params.name)
    .on('log', res.write.bind(res))
    .on('end', res.end.bind(res));
};
