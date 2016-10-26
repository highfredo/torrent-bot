/**
 * Created by highfredo on 25/10/2016.
 */

const _ = require('lodash')

module.exports = function (field, values) {
   var arr = _.isArray(values) ? values : [values]
   return function (info) {
      var b = info[field] === undefined || _.includes(arr, info[field])
      return b
   }
}
