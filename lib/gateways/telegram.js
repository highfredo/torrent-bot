const TelegramBot = require('node-telegram-bot-api');
const templater = require('../templater')
const _ = require('lodash')

/*let telegramBot = new TelegramBot(config.telegram.token, {
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

function buildBody(data) {
   let inlineKeyboard = Array.isArray(data) ?
      data.map(function (torrent) {
         let text = templater.build(torrent.type+'_btn', torrent).trim()
         return [{text: text, callback_data: torrent.id}]
      }) :
      [[{text: "Descargar", callback_data: data}]]

   return {
      parse_mode: 'HTML',
      reply_markup: {
         inline_keyboard: inlineKeyboard
      }
   }
}


class TelegramGateway {
   constructor(config) {
      this.userId = config.userId
      this.bot = new TelegramBot(config.token, {polling: true})
      this.onRequestAddTorrent = () => undefined // noop


      this.bot.on('callback_query', (msg) => {
         if (!msg.data || msg.from.id !== this.userId) return
         this.onRequestAddTorrent({
            torrentId: msg.data,
            data: msg
         })
      })
   }

   sendMessage(txt, options) {
      return this.bot.sendMessage(this.userId, txt, options)
   }

   onTorrentAdded(options) {
      return this.bot.answerCallbackQuery(options.id, "Torrent añadido")
   }

   async sendTorrentInfo(data) {
      await this.bot.sendPhoto(this.userId, data.photo)
      return this.bot.sendMessage(this.userId, templater.build(data.type, data), buildBody(data.id))
   }

   async sendTorrentInfoBulk(torrents) {
      let self = this
      Promise.each(Object.values(_.groupBy(torrents, 'title')), async function(value) {
         let data = value[0]
         await self.bot.sendPhoto(self.userId, data.photo)
         return self.bot.sendMessage(self.userId, templater.build(data.type, data), buildBody(value))
      })
   }

}

module.exports = function (config) {
   return new TelegramGateway(config)
}
