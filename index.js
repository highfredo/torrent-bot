var config = require('./config')

global.Promise = require('bluebird')
global.types = require('./lib/types')
global._ = require('lodash')


const gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
const seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox, gateway)
const tracker = require('./lib/trackers/' + config.tracker.type)(config.tracker, gateway)
const info    = require('./lib/info/' + config.info.type)(config.info)

const filterUtils = require('./lib/filters/utils')
const filters = filterUtils.parseFilters(config.filters)


sendNewTorrents()
setInterval(sendNewTorrents, config.refreshInterval)

var lastUpdate;
function sendNewTorrents() {
   console.log("BUSCANDO NUEVOS TORRENTS")
   tracker
      .latest()
      .then(result => {
         result = _.filter(result, i => !(lastUpdate && i.date < lastUpdate))
         result = applyFilters(result)
         result = _.sortBy(result, ['date'])

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


function applyFilters(infoArray) {
   return _.filter(infoArray, function (info) {
      var filtersOfType = filters[info.type]

      if(!filtersOfType) {
         filtersOfType = filters.default
      }

      if(!filtersOfType) {
         return true
      }

      return filterUtils.and(info, filtersOfType.filter || [])
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
