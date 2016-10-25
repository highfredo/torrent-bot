var config = require('./config')
var Promise = require('bluebird')
global.Promise = Promise

var gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
var seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox, gateway)
var tracker = require('./lib/trackers/' + config.tracker.type)(config.tracker, gateway)
var info    = require('./lib/info/' + config.info.type)(config.info)

var types = require('./lib/types')
var _ = require('lodash')
global._ = _
global.types = types

sendNewTorrents()
setInterval(sendNewTorrents, 60 * 60 * 1000) // 1h 3600000

var lastUpdate;
function sendNewTorrents() {
   console.log("BUSCANDO NUEVOS TORRENTS")
   tracker
      .latest()
      .then(result => {
         // TODO: filtrar en base a las preferencias de usuario
         result = _.filter(result, i => !(lastUpdate && i.date < lastUpdate))
         // result = _.filter(result, i => i.type === types.MOVIE)
         result = _.sortBy(result, ['date']);

         Promise
            .all(_.map(result, o => info.fill(o)))
            .then(()=>{
               Promise.each(result, function(info){
                  return gateway.sendTorrentInfo(info)
               })
            })

         lastUpdate = new Date()
      })
}


gateway.onRequestAddTorrent(function (msg) {
   tracker.decodeMagnet(msg.data)
      .then((magnet) => {
         console.log("Added: " + msg.data)
         return seedbox.addMagnet(magnet)
      })
   }
)
