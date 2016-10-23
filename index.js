var config = require('./config')

var gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
var seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox)
var tracker = require('./lib/trackers/' + config.tracker.type)(config.tracker)

var types = require('./lib/types')
var _ = require('lodash')
global.types = types

sendNewTorrents()
setInterval(sendNewTorrents, 60 * 60 * 1000) // 1h 3600000

var lastUpdate;
function sendNewTorrents() {
   console.log("BUSCANDO NUEVOS TORRENTS")
   tracker
      .latest()
      .then(result => {
         result.forEach(info => {
            // TODO: filtrar en base a las preferencias de usuario
            if (!(lastUpdate && info.date < lastUpdate)) {
               console.log("Enviando: " + info.title)
               gateway.sendTorrentInfo(info)
            } else {
               console.log(info.title + ' no ha pasado el filtro')
            }
         })

         lastUpdate = new Date()
      })
}


gateway.onRequestAddTorrent = function (msg) {
   tracker.decodeMagnet(msg.data).then((magnet)=> {
      console.log("Added: " + msg.data)
      seedbox.addMagnet(magnet)
   })
}
