var request = require('request');
var config = require('../config');
var fanfou = config.fanfou;
var sign = require('../utils/sign');
var _ = require('lodash');

// POST Message
function postMessage(post, others,callback) {
  // console.log(post)
  var base_url = 'http://api.fanfou.com/statuses/update.json';
  if (post.code) {
    var dict = {}
    var obj = _.assign(dict,{
      status: post.text.length > 140?post.text.substr(0,140):post.text,
      format: 'html'
    },others)
    
  }
  sign.getAccessDict(obj, function (err, dict) {
    sign.signatureAccess ('POST', base_url, dict, function (err1, oauth_signature) {
      _.assign(dict,obj,{
        oauth_signature:oauth_signature
      })
      request.post({
        url: base_url,
        form: dict
      },
        function (error, response, body) {
          callback(error, body)
          // console.log(req.session.fanfouOauth)          
        }
      )
    })
  })
}

// get Replies
function getReplies(obj, callback) {
  var base_url = 'http://api.fanfou.com/statuses/replies.json';
  sign.getAccessDict(obj, function (err, dict) {
    // console.log('AccessDict:',dict)
    sign.signatureAccess ('GET', base_url, dict, function (err1, oauth_signature) {
      // console.log(oauth_signature)
      request.get(
        sign.url('GET', base_url,dict, oauth_signature),
        function (error, response, body) {
          // console.log(body)
          if (!error && response.statusCode == 200) {
            callback(body)
          }
        })
    })

  })
}

module.exports = {
  getReplies:getReplies,
  postMessage:postMessage
}
