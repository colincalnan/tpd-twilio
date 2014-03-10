
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.outboundSMS = function(req, res){
  res.render('outboundSMS', { title: 'Send an SMS (text) message' });
};