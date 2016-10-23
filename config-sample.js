/*******
 rename to config.js
 *******/

module.exports =
{
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
