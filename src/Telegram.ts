import {Link, Pelicula, VivaTorrent} from "./Vivatorrent"
import {Transmission} from "./Transmission";
const TelegramBot = require('node-telegram-bot-api')


export class Telegram {
  private bot: any
  private userId: number

  constructor(private options: any, private tracker: VivaTorrent, private seedbox: Transmission) {
    this.userId = options.userId

    this.bot = new TelegramBot(options.token, options)
    if(options.webHook) {
      this.bot.setWebHook(`${options.webHook.publicUrl}/bot${options.token}`)
    }
    this.bot.sendMessage(this.userId, 'Iniciado')

    this.bot.on('callback_query', (msg) => {
      if (!msg.data || msg.from.id !== this.userId) return
      let [action, linkId] = msg.data.split(':')
      this[action](linkId, msg)
    })

    this.bot.onText(/^(?!\/).+/, async (msg) => {
      await this.bot.sendMessage(this.userId, "Buscando...")
      let pelis = await this.tracker.search(msg.text)
      if(pelis.length) {
        this.sendPelis(pelis.reverse())
      } else {
        this.bot.sendMessage(this.userId, 'No hay ningún resultado 😩')
      }
    })
  }

  async sendPeli(peli: Pelicula): Promise<void> {
    await this.bot.sendPhoto(this.userId, peli.photo, {disable_notification: true})
    let inline_keyboard = {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: peli.links.map((link: Link) => {
          return [{text: this.buildButtonLabel(link), callback_data: 'add_torrent:'+link.id}]
        })
      }
    }

    await this.bot.sendMessage(this.userId, this.buildDescription(peli), inline_keyboard)
  }

  async sendPelis(pelis: Pelicula[]): Promise<void> {
    for(let i = 0; i < pelis.length; i++) {
      await this.sendPeli(pelis[i])
    }
  }

  private async add_torrent(linkId: string, msg) {
    try {
      let torrent = await this.tracker.getTorrentFile(linkId)
      await this.seedbox.add(torrent)
      this.bot.answerCallbackQuery(msg.id, "Torrent añadido")
    } catch (e) {
      console.log(e)
      this.bot.answerCallbackQuery(msg.id, "Fallo al añadir torrent")
    }
  }

  /*
    PRIVATE
  */
  private buildDescription(peli: Pelicula): string {
    return `<a href="${peli.trailer}">${peli.title}</a> ${peli.release_date ? '('+peli.release_date.getFullYear()+')' : ''}
${peli.description}`
  }

  private buildButtonLabel(link: Link): string {
    return `${link.fuente} - ${link.quality} (${link.size})`
  }

}
