var TelegramBot = require('node-telegram-bot-api');
var templater = require('../templater')

/*var telegramBot = new TelegramBot(config.telegram.token, {
 webHook: {
 port: config.telegram.port,
 key: config.telegram.key,
 cert: config.telegram.cert
 }
 });
 telegramBot.setWebHook(`${config.telegram.url}:${config.telegram.port}/bot${config.telegram.token}`, config.telegram.cert);
 telegramBot.on('message', function (msg) {
 console.log(JSON.stringify(msg, null, 4))
 });
 */

module.exports = function (config) {
   var telegramBot = new TelegramBot(config.token, {polling: true})
   var _onRequestAddTorrent = function () { }

   var service = {
      sendTorrentInfo: function (data) {
         return telegramBot
            .sendPhoto(config.userId, data.photo)
            .then(()=>{
               return telegramBot.sendMessage(config.userId, templater.build(data.type, data),
                  {
                     parse_mode: 'HTML',
                     reply_markup: {
                        inline_keyboard: [
                           [{text: "Descargar", callback_data: data.id}]
                        ]
                     }
                  })
            })
      },
      onRequestAddTorrent: function (cb) {
         _onRequestAddTorrent = cb
      },
      sendMessage: function (txt, options) {
         return telegramBot.sendMessage(config.userId, txt, options)
      }
   }


   // This event is triggered when a button is pressed in telegram bots
   telegramBot.on('callback_query', function (msg) {
      if (!msg.data || msg.from.id !== config.userId) return
      _onRequestAddTorrent(msg)
   });

   // telegramBot.on('message', function(msg){
   //     console.log(JSON.stringify(msg))
   // });


   return service
}
