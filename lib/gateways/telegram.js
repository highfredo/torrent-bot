var TelegramBot = require('node-telegram-bot-api');

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

    var service = {
        sendTorrentInfo: function(data) {
            telegramBot.sendPhoto(config.userId, data.photo,
                {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: "Descargar: " + data.title, callback_data: data.id }]
                        ]
                    })
                }
            )
        },
        onRequestAddTorrent: function () { }
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