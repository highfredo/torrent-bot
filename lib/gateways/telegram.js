var TelegramBot = require('node-telegram-bot-api');

module.exports = function (config) {
  var telegramBot = new TelegramBot(config.token, {polling: true})

  var service = {
    sendMessage: sendMessage,
    sendTorrentInfo: sendTorrentInfo,
    onRequestAddTorrent: noop // callback llamado al pulsar el boton en tg
  };
  
  function sendMessage(){
    telegramBot.sendMessage.apply(undefined, arguments);
  }

  function noop(){}

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

  // This event is triggered when a button is pressed in telegram bots
  telegramBot.on('callback_query', function(msg){
    if(!msg.data || msg.from.id !== config.userId) {
      service.sendMessage(msg.from.id, "Tu no mami");
    }else{
      service.onRequestAddTorrent(msg)
    }
  })

  return service;
};