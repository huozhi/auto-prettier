'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const ignores = require('ignore')()
const prettier = require('prettier')
const prettierConfig = require('./config')

// TODO: customized
const basedir = path.resolve(__dirname, '../..')
const customizedPath = path.resolve(basedir, './**/*.js')

const globOptions = {dot: true}
const ignoreFilePath = path.resolve(basedir, '.gitignore')
let ignoreContent = []

if (fs.existsSync(ignoreFilePath)) {
  ignoreContent = fs
    .readFileSync(ignoreFilePath, 'utf-8')
    .split('\n')
    .filter(Boolean)
}

const rules = ignores.add(ignoreContent)

function matchFiles() {
  return new Promise((resolve, reject) => {
    glob(customizedPath, globOptions, (err, matches) => {
      if (err) {
        reject(err)
      }
      resolve(rules.filter(matches))
    })
  })
}

matchFiles().then(filenames => {
  filenames.forEach(filename => {
    const filePath = path.resolve(filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    const formatted = prettier.format(content, prettierConfig)
    fs.writeFileSync(filePath, formatted, 'utf-8')
    console.log('write', filePath)
  })
})
