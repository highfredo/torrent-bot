"use strict"

var rp = require('request-promise')
var api = "https://palomitas-dl.fuken.xyz/torrents";

class Palomitas {
   getVideoLink(res) {
      var hash = res.data;
      var torrentUrl = api + "/" + hash;
      return rp.get(torrentUrl).then(function (res) {
         var files = res.data.files;
         var biggestFile = files.reduce(function (prev, next) {
            return prev.length > next.length ? prev : next;
         });
         return playerUrl + biggestFile.link;
      });
   }

   addMagnet(magnetLink) {
      return rp.post({
         method: 'POST',
         uri: api,
         json: {link: magnetLink}
      })
         .then(this.getVideoLink);
   }
}

module.exports = function (params) {
   return new Palomitas();
}
