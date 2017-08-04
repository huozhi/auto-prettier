'use strict'

const fs = require('fs')
const path = require('path')
const globby = require('globby')
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

let changeFileCount = 0

function filterIgnores(paths) {
  return Promise.resolve(rules.filter(paths))
}

function findGlobMatches(files) {
  return globby(files, options.glob)
}

function writeFileIfNecessary(filename) {
  const filePath = path.resolve(filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const formatted = prettier.format(content, prettierConfig)
  if (content !== formatted) {
    changeFileCount++
    fs.writeFileSync(filePath, formatted, 'utf-8')
    log('write', filePath)
  }
}

function batchWriteFiles(files) {
  files.forEach(writeFileIfNecessary)

  if (changeFileCount === 0) {
    log('No File Changed!')
  } else {
    log('Overwrite Finished')
  }
}

function main() {
  findGlobMatches(options.files).then(filterIgnores).then(batchWriteFiles)
}

// execute
main()
