module.exports = {
  fanfou: {
    ConsumerKey:'Your Fanfou Consumer Key',
    ConsumerSecret:'Your Fanfou Consumer Secret',
    RequestTokenURL:'http://fanfou.com/oauth/request_token',
    AccessTokenURL:'http://fanfou.com/oauth/access_token',
    AuthorizeURL:'http://fanfou.com/oauth/authorize',
    oauthSignatureMethod:'HMAC-SHA1',
    CallbackURL: 'http://127.0.0.1:5850/fanfou/chatbot/callback'
  },
  tuling:{
    Api:'http://www.tuling123.com/openapi/api',
    Key:'Your Tuling Api Key'
  },
  settings: {
    port: '5850'
  }
}