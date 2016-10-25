var templater = require('../templater')


module.exports = function (config) {
   var _onRequestAddTorrent = function () { }

   var service = {
      sendTorrentInfo: function (data) {
         console.log('('+data.id+')')
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

   global.addTorrent = function(id) {
      _onRequestAddTorrent({data: id})
   }

   return service
}
