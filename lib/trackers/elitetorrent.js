"use strict"

var FeedParser = require('feedparser'),
   request = require('request'),
   rp = require('request-promise'),
   types = require('../types')

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
            var type = /Categoría: (.*?) /.exec(data.description)[1] === 'Series' ? types.SHOW : types.MOVIE
            // var quality = type === types.MOVIE ? /Peliculas (\w+) /.exec(data.description)[1] : undefined
            var year = /Año: (\d+)/.exec(data.description)
            year = year ? year[1] : undefined;

            var info = {
               title: data.title.trim(),
               date: data.date,
               link: data.link,
               id: id,
               photo: `http://www.elitetorrent.net/thumb_fichas/${id}_g.jpg`,
               type: type,
               year: year
               // quality: quality
               // season: season
               // episode: episode
            }

            if(type === types.MOVIE) {
               var i = info.title.lastIndexOf('(');
               if (i != -1) {
                  info.quality = info.title.substr(i + 1).slice(0, -1);
                  info.title = info.title.substr(0, i).trim()
               }
            } else if(type === types.SHOW) {
               // TODO:
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

