
const _ = require('lodash')

module.exports = {
   or: function (info, filtersArray) {
      if(!filtersArray || !filtersArray.length)
         return true

      let result = false
      filtersArray.forEach(function (filter) {
         if(filter(info)) {
            result = true
            return false
         }
      })

      return result
   },
   and: function (info, filtersArray) {
      if(!filtersArray || !filtersArray.length)
         return true

      let result = true
      filtersArray.forEach(function (filter) {
         if(!filter(info)) {
            result = false
            return false
         }
      })

      return result
   },
   parseFilters: function (configFilter) {
      return _.keyBy(configFilter, 'type');
   }
}
