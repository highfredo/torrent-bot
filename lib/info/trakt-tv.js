"use strict"

const rp = require('request-promise')

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

   _movieDescription(info) {

      return this
         ._get('/search/movie', {
            query: info.title,
            field: 'title'
         })
         .then((movies) => {
            if(!movies.length)
               throw new Error("No movie found")

            movies = movies.map((hit) => {
               return hit.movie;
            })

            let movie
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
                  let hit = _.find(results, result => !!result.overview)
                  return hit ? hit.overview : ""
               })
         })

   }

   fill(info) {
      let action;
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
