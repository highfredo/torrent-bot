"use strict"

const fs = require('fs')
const _ = require('lodash')

class Templater {
   constructor(path) {
      this.templates = {}
      _.forEach(fs.readdirSync(path), (fileName) => {
         var tplName = fileName.replace('.tpl', '')
         this.templates[tplName] = _.template(fs.readFileSync(path + '/' + fileName, 'utf8'))
      });
   }

   build(type, params) {
      var compiler = this.templates[type.toLowerCase()]
      return compiler ? compiler({info: params}) : this.templates.default({info: params})
   }
}


module.exports = new Templater('templates')
