import glob from './node_modules/glob/glob.js'
import jsonfile from './node_modules/jsonfile/index.js'
import write from './node_modules/write/index.js'

const unordered = {}
let missing = []
const keys = Object.keys(jsonfile.readFileSync('./lang/en.json'))

glob('./lang/*.json', {}, async function (er, files) {
  await Promise.all(
    files.map(async filename => {
      const lang = filename.replace(/^(.+\/)([a-zA-Z0-9-]+)(\.json)$/, '$2')
      if (lang !== 'en') {
        const json = jsonfile.readFileSync(filename)
        unordered[lang] = keys.filter(x => !Object.keys(json).includes(x))
        missing = missing.concat(unordered[lang])
      }
    })
  )
  const langs = Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key]
      return obj
    }, {})
  let output = ''
  output = output + '# Translating.\n\n'
  output =
    output +
    'Thank you for being interested in making Call of Cthulhu 7th Edition for Foundry VTT better! Below is a list of translations keys on existing files that still need translated, based on `en.json`. Feel free to create a new `*.json` file for a language that is not shown here!\n\n'
  output = output + '|Key|'
  Object.entries(langs).forEach(([key, value]) => {
    output = output + key + '|'
  })
  output = output + '\n'
  output = output + '|:---|'
  Object.entries(langs).forEach(([key, value]) => {
    output = output + ':---:|'
  })
  output = output + '\n'
  missing
    .filter((item, index) => {
      return missing.indexOf(item) === index
    })
    .sort()
    .forEach(key => {
      output = output + '|' + key + '|'
      Object.entries(langs).forEach(([lang, value]) => {
        output = output + (value.includes(key) ? 'X' : '') + '|'
      })
      output = output + '\n'
    })
  output = output + '|**Remaining**:|'
  Object.entries(langs).forEach(([key, value]) => {
    output = output + value.length + '|'
  })
  output = output + '\n'
  write('./.github/TRANSLATIONS.md', output)
})