/* TODO
--------
- split interv's dossiers by seance
- add metas on dossier
- add link to LFDLL
- add metrics by dossier
- add metas on seance (sommaire, top orateurs, stats didascalies ..)
- add metrics by seance ?
- filter dossiers nearly empty/non legislative (no id_an)
- lighten data by removing redundancy field
*/


const dsv = require('d3-dsv');
const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');

const DATA_FOLDER = path.resolve(__dirname + '/../data/');
const OUTPUT_FOLDER = path.resolve(__dirname + '/../rififi/server/data/');

fs.ensureDir(`${OUTPUT_FOLDER}/dossiers`)
  .then(() => fs.readFile(`${DATA_FOLDER}/dossiers.json`))
  .then(dossiers => Promise.all(
    JSON.parse(dossiers).map(dossier => {
      const nom = slugify(dossier.key);
      const filename = `${OUTPUT_FOLDER}/dossiers/${nom}.json`;
      console.log(filename);
      let seances = [];
      let curSeance = {};
      dossier.values.forEach(function(i){
        if (i.seance_id !== curSeance.id) {
          if (curSeance.id) seances.push(curSeance);
          curSeance = {
            id: i.seance_id,
            sommaire: [],
            orateurs: [],
            interventions: []
          }
        }
        curSeance.interventions.push(i);
      });
      seances.push(curSeance)
      let dos = {
        id: nom,
        nom: dossier.key,
        id_an: null,
        metrics: {},
        seances: seances
      };
      return fs.writeFile(filename, JSON.stringify(dos), 'utf8');
    })
  ))
  .catch(console.error)
