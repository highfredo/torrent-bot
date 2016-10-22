var TelegramBot = require('node-telegram-bot-api');

module.exports = function (config) {
  var telegramBot = new TelegramBot(config.token, {polling: true})

  var service = {
    sendTorrentInfo: sendTorrentInfo,
    onRequestAddTorrent: function(){}
  }

  function sendTorrentInfo(data) {
    var reply = {
      reply_markup: JSON.stringify({
        inline_keyboard: [[{ 
          text: "Descargar: " + data.title,
          callback_data: data.id 
        }]]
      })
    } 
    telegramBot.sendPhoto(config.userId, data.photo, reply);
  }

  telegramBot.on('callback_query', function(msg){
    if(!msg.data || msg.from.id !== config.userId) return
    service.onRequestAddTorrent(msg)
  });

  // telegramBot.on('message', function(msg){
  //     console.log(JSON.stringify(msg))
  // });


  return service
}