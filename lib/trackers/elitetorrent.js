"use strict"

var FeedParser = require('feedparser'),
   request = require('request'),
   rp = require('request-promise'),
   types = require('../types'),
   utils = require('../utils')

class ElitetorrentTracker {
   constructor() {
      console.log("Tracker: Elitetorrent")
   }

   latest() {
      var req = request('http://www.elitetorrent.net/rss.php'),
         feedparser = new FeedParser({addmeta: false})

      return new Promise((resolve, reject)=> {
         req.on('error', reject)
         feedparser.on('error', reject)
         var result = []

         req.on('response', function (res) {
            var stream = this;
            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
            stream.pipe(feedparser);
         })

         feedparser.on('data', function (data) {

            var id = data.link.match(/torrent\/([^)]+)\//)[1]
            var attrs = utils.attrStringToMap(data.description)
            var seasonEpisode = utils.stringToSeasonAndEpisode(data.title) || {}

            var info = {
               title: utils.cleanTitle(data.title),
               date: data.date,
               link: data.link,
               id: id,
               photo: `http://www.elitetorrent.net/thumb_fichas/${id}_g.jpg`,
               type: attrs.categoria === 'Series' ? types.SHOW : types.MOVIE,
               year: attrs.ano,
               quality: utils.stringToQuality(attrs.categoria),
               season: seasonEpisode.season,
               episode: seasonEpisode.episode
            }

            result.push(info)
         })

         feedparser.on('end', () => resolve(result));
      })
   }

   decodeMagnet(id) {
      return rp.get(`http://www.elitetorrent.net/torrent/${id}/`).then((page)=> {
         return page.match(/(?=magnet).*?(?=")/)[0].split("&amp;").join("&");
      })
   }
}

module.exports = function (config) {
   return new ElitetorrentTracker()
}

