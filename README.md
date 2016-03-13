饭否聊天机器人
===

使用步骤
---
### install
`npm install`

### init
- 填写 `config.test.js`, 并改名成`config.js`
- 本机启动 `redis-server`
- 获取 `oauth` 信息
  - `node bin/www`
  - 本机访问 `{hostname:port}/fanfou/chatbot/oauth`

### start
- 启动定时服务 `node do/do.js`

技术栈
---
- redis (GET SET SUB PUB)
- express (http)
- lodash (Object 操作)
- 图灵机器人 API
- 饭否机器人 API

License
---
[MIT](LiCENSE)