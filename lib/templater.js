"use strict"

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

class Templater {
   constructor(templateDir) {
      this.templates = {}
      this.templateDir = path.resolve(__dirname, templateDir)
      fs.readdirSync(this.templateDir).forEach((fileName) => {
         let tplName = fileName.replace('.tpl', '').toLowerCase()
         this.templates[tplName] = _.template(fs.readFileSync(path.resolve(this.templateDir, fileName), 'utf8'))
      });
   }

   build(type, params) {
      let compiler = this.templates[type.toLowerCase()]
      return compiler ? compiler({info: params}) : this.templates.default({info: params})
   }
}


module.exports = new Templater('../templates')
