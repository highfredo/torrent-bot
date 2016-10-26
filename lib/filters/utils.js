
const _ = require('lodash')

module.exports = {
   or: function (info, filtersArray) {
      if(!filtersArray || !filtersArray.length)
         return true

      var result = false
      _.forEach(filtersArray, function (filter) {
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

      var result = true
      _.forEach(filtersArray, function (filter) {
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
