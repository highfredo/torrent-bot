/**
 * Created by highfredo on 25/10/2016.
 */

const _ = require('lodash')

module.exports = function (field, values) {
   let arr = _.isArray(values) ? values : [values]
   return function (info) {
      return info[field] === undefined || _.includes(arr, info[field])
   }
}
