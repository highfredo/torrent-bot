var templater = require('../templater')


module.exports = function (config) {
   var _onRequestAddTorrent = function () { }

   var service = {
      sendTorrentInfo: function (data) {
         console.log(templater.build(data.type, data))
         return new Promise.resolve(data)
      },
      onRequestAddTorrent: function (cb) {
         _onRequestAddTorrent = cb
      },
      sendMessage: function (txt, options) {
         console.log(txt)
      }
   }

   return service
}
