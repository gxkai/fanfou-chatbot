var request = require('request');
var config = require('../config');
// var strings = require('../utils/strings');

var _ = require('lodash');

var tuling = config.tuling;

module.exports = function (reply, callback) {
  request.post({
    url: tuling.Api,
    form: _.assign({key: tuling.Key},reply)
  }, function (error, response, result) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(result)
      if(/^400/.test(body.code)){
        callback( {
                  code: 0,
                  text: 'retry'
                })
      }
      switch(body.code) {
        case 100000:
          callback(body);
          break;
        case 200000:
          callback({
            code: body.code,
            text: body.text + body.url
          });
          break;
        case 302000:
          var text = body.list[parseInt(body.list.length*Math.random())];
          callback({
            code: body.code,
            text: text.article+' '+ text.detailurl
          });
          break;
        case 308000:
          var text = body.list[0];
          callback({
            code: body.code,
            text: body.text + text.name + ' ' + text.info + text.detailurl
          });
          break;
      }
    }
  })
}