/*******
 rename to config.js
 *******/

var generateFilter = require('./lib/filters/byValue')
var types = require('./lib/types')
var qualities = require('./lib/qualities')

module.exports =
{
   refreshInterval: 60 * 60 * 1000, // En milisegundos
   filters: [ // Aplica solo los del tipo correspondiente
      {
         type: types.MOVIE,
         filter: [ // AND filter
            generateFilter('quality', [qualities.OTHER, qualities.HDRip, qualities.microHD])
         ]
      },
      {
         type: types.SHOW,
         filter: [
            generateFilter('episode', [1])
         ]
      },
      {
         type: 'default',
         filter: []
      }
   ],
   seedbox: {
      type: 'transmission',
      user: "<transmission user>",
      pass: "<transmission pass>",
      rpc: "http://<transmission host>:<transmission port>/transmission/rpc"
   },
   tracker: {
      type: 'elitetorrent'
   },
   gateway: {
      type: 'telegram',
      token: '<telegram token>',
      userId: 0 // <telegram userId>
   }
}
