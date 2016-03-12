var express = require('express');
var router = express.Router();
var oauth = require('../controllers/oauth');

/* GET home page. */
router.get('/oauth', 
  oauth.getUnauthorizedRequestToken, 
  oauth.authorizeForRequestToken);

router.get('/callback',
 oauth.authorizeRequestTokenForAccessToken);

module.exports = router;
