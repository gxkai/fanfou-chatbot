var querystring = require('querystring');
var Redis = require('ioredis');
var config = require('../config');
var request = require('request');
var sign = require('../utils/sign');
var fanfou = config.fanfou;
var redis = new Redis();


exports.getUnauthorizedRequestToken = function(req, res, next) {
  var base_url = fanfou.RequestTokenURL;
  var dict = sign.getDict();
  var base_string = sign.baseString('GET', base_url, dict)
  var base_secret = fanfou.ConsumerSecret+'&';
  
  dict.oauth_signature = sign.signature(base_string, base_secret)
  
  request.get(
    sign.url('GET',base_url, dict),
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = querystring.parse(body)
        redis.set('fanfou_oauth_token', result.oauth_token);
        redis.set('fanfou_oauth_token_secret', result.oauth_token_secret);
        next();
      }
    })
}

exports.authorizeForRequestToken = function (req, res, next) {
  redis.get('fanfou_oauth_token', function (err, oauth_token) {
    var dict = {
      oauth_token: oauth_token,
      callback_url: encodeURIComponent(fanfou.CallbackURL)
    }
    res.redirect(sign.url('GET',fanfou.AuthorizeURL, dict))
  })
}

exports.authorizeRequestTokenForAccessToken = function (req, res, next) {
  var base_url = fanfou.AccessTokenURL;
  // 获取字典
  var dict = sign.getDict({oauth_token:req.query.oauth_token})
  redis.get('fanfou_oauth_token_secret', function (err,oauth_token_secret) {
    // 签名
    var base_string = sign.baseString('GET', base_url, dict)
    var base_secret = fanfou.ConsumerSecret+'&'+oauth_token_secret;
    dict.oauth_signature = sign.signature (base_string, base_secret);
    request.get(sign.url('GET',base_url, dict), function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var oauth_token = querystring.parse(body);
          redis.set('fanfou_access_token', oauth_token.oauth_token);
          redis.set('fanfou_access_token_secret', oauth_token.oauth_token_secret);
          return res.json(oauth_token);
        }
    })
  })
}