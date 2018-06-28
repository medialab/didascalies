const dsv = require('d3-dsv');
const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');

const DATA_FOLDER = path.resolve(__dirname + '/../data/');
const OUTPUT_FOLDER = path.resolve(__dirname + '/../debats/public/data/');

fs.ensureDir(`${OUTPUT_FOLDER}/dossiers`)
  .then(() => fs.readFile(`${DATA_FOLDER}/dossiers.json`))
  .then(dossiers => Promise.all(
    JSON.parse(dossiers).map(dossier => {
      const nom =  `${OUTPUT_FOLDER}/dossiers/${slugify(dossier.key)}.json`;
      console.log(nom);
      return fs.writeFile(nom, JSON.stringify(dossier.values), 'utf8')
    })
  ))
  .catch(console.error)
