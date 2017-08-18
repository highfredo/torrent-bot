/*******
 rename to config.js
 *******/

export default {
   telegram: {
      token: '<bot token>',
      userId: 0, // your userId
      // polling: true,
      webHook: {
         publicUrl: '<public server url>',
         host: '::',
         port: 80
      }
   },
   transmission: {
      username: '<transmission username>',
      pass: '<transmission pass>',
      rpc: '<transmission http rpc route>'
   }
}
