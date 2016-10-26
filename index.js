var config = require('./config')
var Promise = require('bluebird')
global.Promise = Promise

var gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
var seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox, gateway)
var tracker = require('./lib/trackers/' + config.tracker.type)(config.tracker, gateway)
var info    = require('./lib/info/' + config.info.type)(config.info)

var filterUtils = require('./lib/filters/utils')
const filters = filterUtils.parseFilters(config.filters)

var types = require('./lib/types')
var _ = require('lodash')
global._ = _
global.types = types

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
