var FeedParser = require('feedparser'),
    request = require('request'),
    rp = require('request-promise'),
    types = require('../types')


module.exports = {
    latest: function () {
        var req = request('http://www.elitetorrent.net/rss.php'),
            feedparser = new FeedParser({addmeta: false})

        return new Promise((resolve, reject)=>{
            req.on('error', reject)
            feedparser.on('error', reject)
            var result = []

            req.on('response', function (res) {
                var stream = this;
                if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
                stream.pipe(feedparser);
            })

            feedparser.on('data', function(data) {

                var id = data.link.match(/torrent\/([^)]+)\//)[1]
                var type = /Categoría: (.*?) /.exec(data.description)[1] === 'Series' ? types.SHOW : types.MOVIE
                // var quality = type === types.MOVIE ? /Peliculas (\w+) /.exec(data.description)[1] : undefined

                var info = {
                    title: data.title,
                    description: data.description,
                    date: data.date,
                    link: data.link,
                    id: id,
                    photo: `http://www.elitetorrent.net/thumb_fichas/${id}_g.jpg`,
                    type: type,
                    // quality: quality
                }

                result.push(info)
            })

            feedparser.on('end', () => resolve(result));
        })
    },
    decodeMagnet: function (id) {
        return rp.get(`http://www.elitetorrent.net/torrent/${id}/`).then((page)=>{
            return page.match(/(?=magnet).*?(?=")/)[0].split("&amp;").join("&");
        })
    }
}

