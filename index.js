var config = require('./config')
var telegram = require('./lib/gateways/telegram')(config.telegram)
var seedbox = require('./lib/seedboxs/transmission')(config.transmission)
var tracker = require('./lib/trackers/elitetorrent')
var types = require('./lib/types')
var _ = require('lodash')

sendNewTorrents()
setInterval(sendNewTorrents, 60 * 60 * 1000) // 1h 3600000

var lastUpdate;
function sendNewTorrents() {
  console.log("BUSCANDO NUEVOS TORRENTS")
  tracker
      .latest()
      .then(result => {
        result.forEach(info => {
          if(filter(info)) {
            console.log("Enviando: " + info.title)
            telegram.sendTorrentInfo(info)
          } else {
            console.log(info.title + ' no ha pasado el filtro')
          }
        })

        lastUpdate = new Date()
      })
}

function filter(info) {
  // if(types.SHOW === info.type)
  //   return false
  return (lastUpdate && info.date < lastUpdate)
}

telegram.onRequestAddTorrent = function(msg) {
  tracker.decodeMagnet(msg.data).then((magnet)=>{
    console.log("Added: " + msg.data)
    seedbox.addMagnet(magnet)
  })
}
