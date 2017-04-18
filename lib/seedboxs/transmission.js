"use strict"

const rp = require('request-promise')

class TransmissionFetch {
   constructor(username, pass, rpc, gateway) {
      this.rpc = rpc;
      this.auth = new Buffer(username + ':' + pass).toString('base64') //btoa(username + ':' + pass);
      this.key = false;
      this.gateway = gateway
   }

   _fetch(data) {
      let headers = {};
      headers.authorization = 'Basic ' + this.auth;
      if (this.key) {
         headers['x-transmission-session-id'] = this.key;
      }

      return rp({
         method: 'POST',
         uri: this.rpc,
         headers: headers,
         json: data
      }).catch((err) => {
         if (err.statusCode === 409) {
            this.key = err.response.headers['x-transmission-session-id'];
            return this._fetch(data);
         }

         throw err;
      })
   }

   addMagnet(magnetLink) {
      let data = {
         "method": "torrent-add",
         "arguments": {
            "paused": false,
            "filename": magnetLink
         }
      }
      return this._fetch(data)
   }
}

module.exports = function (params, gateway) {
   return new TransmissionFetch(params.user, params.pass, params.rpc, gateway)
}
