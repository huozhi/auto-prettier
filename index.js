'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const ignores = require('ignore')()
const prettier = require('prettier')
const prettierConfig = require('./config')

const log = (str, ...args) => {
  console.log('\x1b[36m%s\x1b[0m', str, ...args)
}

const options = {
  files: ['./**/*.js'],
  glob: {
    dot: true,
  },
}

const appdir = fs.realpathSync(process.cwd())
const pkgPath = path.resolve(appdir, 'package.json')
const ignoreFilePath = path.resolve(appdir, '.gitignore')

if (fs.existsSync(pkgPath)) {
  const pkg = require(pkgPath)
  Object.assign(options, pkg['auto-prettier'])
}

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
    glob(options.files.join(), options.glob, (err, matches) => {
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
    if (content !== formatted) {
      fs.writeFileSync(filePath, formatted, 'utf-8')
      log('write', filePath)
    } 
  })
  log('Finished')
})

