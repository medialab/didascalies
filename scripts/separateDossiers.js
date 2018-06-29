/* TODO
--------
- add metas on seance (sommaire, stats didascalies ..)
- add metrics by seance ?
- add metrics by dossier
- filter dossiers nearly empty/non legislative (no id_an)
- lighten data by removing redundancy field
*/

const dsv = require('d3-dsv');
const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');

const DATA_FOLDER = path.resolve(__dirname + '/../data/');
const OUTPUT_FOLDER = path.resolve(__dirname + '/../rififi/server/data/');

const dossiersMap = dsv.tsvParse(fs.readFileSync(`${DATA_FOLDER}/dossiers_ids.tsv`, 'utf8'))
  .filter(d => d.nb_interventions > 10)
  .reduce((result, obj) => {
    return Object.assign(result, { [obj.titre]: obj.id_dossier_an.replace("NULL", "") || null })
  }, {});
fs.ensureDir(`${OUTPUT_FOLDER}/dossiers`)
  .then(() => fs.readFile(`${DATA_FOLDER}/dossiers.json`))
  .then(dossiers => Promise.all(
    JSON.parse(dossiers).map(dossier => {
      const nom = slugify(dossier.key);
      const filename = `${OUTPUT_FOLDER}/dossiers/${nom}.json`;
      console.log(filename);
      const seances = [];
      let curSeance = {};
      dossier.values.forEach(function(i){
        if (i.seance_id !== curSeance.id) {
          if (curSeance.id) seances.push(curSeance);
          curSeance = {
            id: i.seance_id,
            sommaire: [],
            parlementaires: {},
            personnalites: {},
            interventions: []
          }
        }
        curSeance.interventions.push(i);
        if (i.parlementaire.replace("NULL", "")) {
          if (!curSeance["parlementaires"][i.parlementaire])
            curSeance["parlementaires"][i.parlementaire] = 0;
          curSeance["parlementaires"][i.parlementaire] += 1;
        } else if (i.nom.replace("NULL", "")) {
          if (!curSeance["personnalites"][i.nom])
            curSeance["personnalites"][i.nom] = 0;
          curSeance["personnalites"][i.nom] += 1;
        }
      });
      seances.push(curSeance);
      let dos = {
        id: nom,
        nom: dossier.key,
        id_an: dossiersMap[dossier.key] || null,
        metrics: {},
        seances: seances
      };
      return fs.writeFile(filename, JSON.stringify(dos), 'utf8');
    })
  ))
  .catch(console.error)
