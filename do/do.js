var statuses = require('../tasks/statuses');
var getReplies = statuses.getReplies;
var postMessage = statuses.postMessage;
var tuling = require('../tasks/tuling');

var later = require('later');
var Redis = require('ioredis');
var pubReply = new Redis();
var subReply = new Redis();
var redis = new Redis()

var sched = later.parse.recur().every(40).second()

subReply.subscribe('reply', function (err, count) {
  later.setInterval(function () {
    redis.get('fanfou_reply_since_id',function (err1,since_id) {
      getReplies(since_id?{since_id:since_id}:{count:'1'},function (replies) {
        // console.log(replies)
        var replies = JSON.parse(replies)
        if (replies[0]) {
          var replyID = replies[0].id
          // console.log('replyID',replyID)
          redis.set('fanfou_reply_since_id',replyID);
        }
        // console.log('---------')
        for (var i = replies.length - 1; i >= 0; i--) {
          var reply = replies[i];
          // console.log(reply.id, reply.text);
          if (/^/) {}
          var replyObj = {
            info: reply.text.replace(/^@聊天机器人\s{1,}/g,''),
            userid: reply.user.id,
          }
          var others = {
            screen_name: reply.user.screen_name,
          }
          if (reply.in_reply_to_status_id) {
            others.in_reply_to_status_id = reply.in_reply_to_status_id
          }
          pubReply.publish('reply',JSON.stringify({
            reply:replyObj,
            others:others
          }))
        }
          // console.log('---------')
      })  
    })
  }, sched);
})


subReply.on('message', function (channel, message) {
  var all = JSON.parse(message);
  tuling(all.reply,function (post) {
    // console.log(post)
    // console.log(post.code)
    post.text = ('@'+all.others.screen_name+' '+post.text).replace('<br>','\n');
    // console.log(post)
    // console.log("========")
    if(post.code){
      postMessage(post, all.others, function (error, result) {
      //   // console.log(result)
      })
    }
  })
})
