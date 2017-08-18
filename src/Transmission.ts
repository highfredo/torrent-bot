import fetch from 'node-fetch'


export class Transmission {

  key: string
  auth: string

  constructor(private opts: {username: string, pass: string, rpc: string}) {
    this.auth = new Buffer(opts.username + ':' + opts.pass).toString('base64')
  }

  async _fetch(body) {
    let headers = {
      authorization: 'Basic ' + this.auth
    }
    if (this.key) {
      headers['x-transmission-session-id'] = this.key;
    }

    let response = await fetch(this.opts.rpc, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })

    if(response.status === 409) {
      this.key = response.headers.get('x-transmission-session-id')
      return this._fetch(body)
    }

    let json = await response.json()

    if(json.result.startsWith('invalid')) {
      throw new Error(json)
    }

    return json
  }

  async add(torrent: Buffer) {
    return this._fetch({
      "method": "torrent-add",
      "arguments": {
        "paused": false,
        "metainfo": torrent.toString('base64')
      }
    })
  }

}
