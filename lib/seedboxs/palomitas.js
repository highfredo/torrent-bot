"use strict"

const rp = require('request-promise')
const api = "https://palomitas-dl.fuken.xyz/torrents";

class Palomitas {
   getVideoLink(res) {
      let hash = res.data;
      let torrentUrl = api + "/" + hash;
      return rp.get(torrentUrl).then(function (res) {
         let files = res.data.files;
         let biggestFile = files.reduce(function (prev, next) {
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
