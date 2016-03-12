var crypto = require('crypto');
var querystring = require('querystring');
var _ = require('lodash');

var config = require('../config');
var fanfou = config.fanfou;

var Redis = require('ioredis');
var redis = new Redis();

function hmacSha1 (str, key) {
  var hmac = crypto.createHmac('sha1',key);
  hmac.update(str);
  return hmac.digest().toString('base64');
}

function nonce () {
  return Math.random().toString(36).substr(2);
}

function kvsort (dict) {
  var kv = []
  for(var key of Object.keys(dict).sort()){
    kv.push(key+"%3D"+dict[key])
  }
  return kv.join('%26');
}

function baseString (method, base_url, dict) {
  // console.log('base_string:',method + '&' + encodeURIComponent(base_url) + '&' + kvsort(dict))
  return method + '&' + encodeURIComponent(base_url) + '&' + kvsort(dict);
}

function signature (base_string, base_secret) {
  return hmacSha1(base_string, base_secret)
}

function signatureAccess (method, base_url, dict, callback) {
  redis.get('fanfou_access_token_secret', function (err, access_token_secret) {
    callback(err, signature (
        baseString(method, base_url, dict), 
        fanfou.ConsumerSecret+'&'+access_token_secret
      )
    )
  })
}

function url (method ,base_url, dict, oauth_signature) {
  switch (method) {
    case 'GET':
      return base_url+'?'+querystring.stringify(dict)+(oauth_signature?('&oauth_signature='+encodeURIComponent(oauth_signature)):'');
      break;
    case 'POST':
      return base_url;
      break;
  }
}

function getDict (obj) {
  return _.assign(
    {
      oauth_consumer_key:fanfou.ConsumerKey,
      oauth_signature_method:fanfou.oauthSignatureMethod,
      oauth_timestamp:parseInt(new Date()/1000)+'',
      oauth_nonce:nonce()
    }
    ,obj);
}

function getAccessDict (obj,callback) {
  redis.get('fanfou_access_token',function (err, access_token) {
    // console.log(access_token)
    var object = 
      _.assign(
        {
          oauth_consumer_key:fanfou.ConsumerKey,
          oauth_token:access_token,
          oauth_signature_method:fanfou.oauthSignatureMethod,
          oauth_timestamp:parseInt(new Date()/1000)+'',
          oauth_nonce:nonce()
        }
        ,encodeAccessDict(obj))
    callback(err, object)
  })
}


function encodeAccessDict (dict) {
  return _.mapValues(dict, function (str) {
    return encodeURIComponent(str).replace(/\%/g,'%25')
  })
}

module.exports = {
  hmacSha1: hmacSha1,
  nonce: nonce,
  kvsort: kvsort,
  baseString: baseString,
  signature: signature,
  signatureAccess:signatureAccess,
  url: url,
  getDict: getDict,
  getAccessDict:getAccessDict,
}