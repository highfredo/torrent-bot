"use strict"

var rp = require('request-promise')

class TrakTV {
   constructor(clientId, clientSecret) {
      this.clientId = clientId
      this.clientSecret = clientSecret
      this.url = 'https://api.trakt.tv'
   }

   _get(path, qs) {
      return rp({
         method: 'GET',
         url: this.url + path,
         qs: qs,
         json: true,
         headers: {
            'trakt-api-version': '2',
            'trakt-api-key': this.clientId
         }
      })
   }

   _cleanTitle(title) {
      // clean title
      var i = title.lastIndexOf('(');
      if (i != -1) {
         return title.substr(0, i).trim()
      }
      return title
   }

   _movieDescription(info) {

      console.log(info.title, this._cleanTitle(info.title))
      return this
         ._get('/search/movie', {
            query: this._cleanTitle(info.title),
            field: 'title'
         })
         .then((movies) => {
            if(!movies.length)
               throw new Error("No movie found")

            movies = _.map(movies, (hit) => {
               return hit.movie;
            })

            var movie
            if(movies.length > 1 && info.year) {
               movie = _.find(movies, function(movie) {
                  return movie.year == info.year
               })
            } else {
               movie = movies[0]
            }

            if(!movie) {
               return ""
            }

            return this._get(`/movies/${movie.ids.slug}/translations/es`)
               .then(results => {
                  var hit = _.find(results, result => !!result.overview)
                  return hit ? hit.overview : ""
               })
         })

   }

   fill(info) {
      var action;
      if(info.type === types.MOVIE) {
         action = this._movieDescription(info)
      } else {
         return
      }

      return action
         .then((description)=>{
            info.description = description.trim()
         })
         .catch((err)=>{ /*console.log(err)*/ })
   }
}


module.exports = function (config) {
   return new TrakTV(config.clientId, config.clientSecret)
}
