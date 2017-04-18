const config = require('./config')

global.Promise = require('bluebird')
global.types = require('./lib/types')
global._ = require('lodash')


const gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
const seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox, gateway)
const tracker = require('./lib/trackers/' + config.tracker.type)(config.tracker, gateway)
const info = require('./lib/info/' + config.info.type)(config.info)

const filterUtils = require('./lib/filters/utils')
const filters = filterUtils.parseFilters(config.filters)


sendNewTorrents()
setInterval(sendNewTorrents, config.refreshInterval)

let lastUpdate;
async function sendNewTorrents() {
   console.log("BUSCANDO NUEVOS TORRENTS")
   let result = (await tracker.latest())
   lastUpdate = new Date()
   result = _.filter(result, i => !(lastUpdate && i.date < lastUpdate))
   result = applyFilters(result)
   result = _.sortBy(result, ['date'])
   console.log("Enlaces encontrados que cumplen el criterio: " + result.length)
   await Promise.all(_.map(result, o => info.fill(o)))


   await gateway.sendTorrentInfoBulk ?
      gateway.sendTorrentInfoBulk(result) :
      Promise.each(result, function (data) {
         return gateway.sendTorrentInfo(data)
      })

   console.log("Enlaces enviados")

   return "OK"
}


function applyFilters(infoArray) {
   return _.filter(infoArray, function (info) {
      let filtersOfType = filters[info.type]

      if (!filtersOfType) {
         filtersOfType = filters.default
      }

      if (!filtersOfType) {
         return true
      }

      return filterUtils.and(info, filtersOfType.filter || [])
   })
}

gateway.onRequestAddTorrent = async function (opt) {
   let magnet = await tracker.decodeMagnet(opt.torrentId)
   await seedbox.addMagnet(magnet)
   return gateway.onTorrentAdded(opt.data)
}

