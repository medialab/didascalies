/* TODO
--------
- add metrics by dossier
- filter dossiers nearly empty/non legislative (no id_an)
- lighten data by removing redundancy field
*/

const dsv = require('d3-dsv');
const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');
const words = require('talisman/tokenizers/words')
const sentences = require('talisman/tokenizers/sentences');

const DATA_FOLDER = path.resolve(__dirname + '/../data/');
const OUTPUT_FOLDER = path.resolve(__dirname + '/../rififi/server/data/');

const dossiersMap = dsv.tsvParse(fs.readFileSync(`${DATA_FOLDER}/dossiers_ids.tsv`, 'utf8'))
  .filter(d => d.nb_interventions > 10)
  .reduce((result, obj) => {
    return Object.assign(result, { [obj.titre]: obj.id_dossier_an.replace("NULL", "") || null })
  }, {});

const addSeance = function(seances, s) {
  s.pc_interruptions = s.nb_interruptions / s.interventions.length;
  seances.push(s);
};

fs.ensureDir(`${OUTPUT_FOLDER}/dossiers`)
  .then(() => fs.readFile(`${DATA_FOLDER}/dossiers.json`))
  .then(dossiers => Promise.all(
    JSON.parse(dossiers)
    .filter(dossier => dossiersMap[dossier.key] !== undefined)
    .map(dossier => {
      const nom = slugify(dossier.key);
      const filename = `${OUTPUT_FOLDER}/dossiers/${nom}.json`;
      console.log(filename);
      const seances = [];
      let curSeance = {};
      dossier.values.forEach(function(i){
        if (i.seance_id !== curSeance.id) {
          if (curSeance.id) addSeance(seances, curSeance);
          curSeance = {
            id: i.seance_id,
            sommaire: [],
            parlementaires: {},
            personnalites: {},
            interventions: [],
            nb_cars: 0,
            nb_mots: 0,
            nb_excl: 0,
            nb_mots: 0,
            nb_interruptions: 0,
            pc_interruptions: 0
          }
        }
        // Metrics on intervention
        if (i.type === "didascalie") {
          i.nb_cars = 0;
          i.nb_mots = 0;
          i.nb_excl = 0;
          i.nb_qust = 0;
          i.nb_phrs = 0;
          i.nb_mwbp = 0;
          i.interruption = true;
        } else {
          let clinterv = i["intervention"].replace(/<[a-z][^>]+>/g, ''),
            phrases = sentences(clinterv);
          i.nb_cars = clinterv.length;
          i.nb_mots = words(clinterv).length;
          i.nb_excl = (clinterv.match(/\!/g) || []).length;
          i.nb_qust = (clinterv.match(/\?/g) || []).length;
          i.nb_phrs = phrases.length;
          i.nb_mwbp = i.nb_cars / i.nb_phrs;
          i.interruption = (i.nb_mots < 20 && i.nb_excl > 0);
        }

        // Agregate by seance
        curSeance.nb_cars += i.nb_cars;
        curSeance.nb_mots += i.nb_mots;
        curSeance.nb_excl += i.nb_excl;
        curSeance.nb_interruptions += i.interruption;

        // count orators
        if (i.parlementaire.replace("NULL", "")) {
          if (!curSeance.parlementaires[i.parlementaire])
            curSeance.parlementaires[i.parlementaire] = 0;
          curSeance.parlementaires[i.parlementaire] += 1;
        } else if (i.nom.replace("NULL", "")) {
          if (!curSeance.personnalites[i.nom])
            curSeance.personnalites[i.nom] = 0;
          curSeance.personnalites[i.nom] += 1;
        }

        curSeance.interventions.push(i);
      });
      addSeance(seances, curSeance);
      total_interv = seances.reduce((res, s) => res + s.interventions.length, 0);
      let dos = {
        id: nom,
        nom: dossier.key,
        id_an: dossiersMap[dossier.key] || null,
        seances: seances,
        nb_interv: total_interv,
        pc_interruptions: seances.reduce((res, s) => res + s.nb_interruptions, 0) / total_interv
      };
      dossiersMap[dossier.key] = dos;
      fs.writeFileSync(filename, JSON.stringify(dos), 'utf8');
      dos.nb_seances = dos.seances.length;
      delete dos.seances;
    })
  ))
  .catch(console.error)
  .then(() => fs.writeFileSync(`${OUTPUT_FOLDER}/liste_dossiers.json`, JSON.stringify(dossiersMap), 'utf8'))
