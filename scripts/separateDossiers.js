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
    return Object.assign(result, { 
      [obj.titre]: 
      obj.id_dossier_an.replace("NULL", "") || null 
    })
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
            pc_interruptions: 0,
            nb_didasc_positives: 0,
            nb_didasc_negatives: 0,
            nb_didasc_neutres: 0,
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
          if (i.ton === 'positif') {
            curSeance.nb_didasc_positives++;
          } else if (i.ton === 'negatif') {
            curSeance.nb_didasc_negatives++;
          } else {
            curSeance.nb_didasc_neutres++;
          }
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

      const sum = (items, key) => items.reduce((sum, item) => sum + item[key], 0);
      total_interv = seances.reduce((res, s) => res + s.interventions.length, 0);

      const merge = (items, key) => items.reduce((res, item) => ({
        ...res,
        ...item,
      }), {})

      const parlementaires = merge(seances, 'parlementaires');
      const personalites = merge(seances, 'personalites');
      let dos = {
        id: nom,
        nom: dossier.key,
        id_an: dossiersMap[dossier.key] || null,
        seances: seances,
        nb_seances: seances.length,
        // sum of nb cars and mots
        nb_cars: sum(seances, 'nb_cars'),
        nb_mots: sum(seances, 'nb_mots'),
        nb_excl: sum(seances, 'nb_excl'),

        parlementaires,
        personalites,
        nb_orateurs: Object.keys(parlementaires).length + Object.keys(personalites).length,
    

        nb_didasc_neutres: sum(seances, 'nb_didasc_neutres'),
        nb_didasc_positives: sum(seances, 'nb_didasc_positives'),
        nb_didasc_negatives: sum(seances, 'nb_didasc_negatives'),
        nb_interruptions: sum(seances, 'nb_interruptions'),
        profile_interruptions: seances.map(s => s.pc_interruptions),
        // mean of nb interruptions
        pc_interruptions: seances.reduce((sum, s) => sum + s.pc_interruptions , 0) / seances.length,
        nb_interv: total_interv,
      };
      dossiersMap[dossier.key] = dos;
      fs.writeFileSync(filename, JSON.stringify(dos), 'utf8');
      dos.nb_seances = dos.seances.length;
      delete dos.seances;
    })
  ))
  .then(() => {
    const liste = `${OUTPUT_FOLDER}/liste_dossiers.json`
    console.log('writing', liste);
    return fs.writeFile(liste, JSON.stringify(dossiersMap), 'utf8')
  })
  .catch(console.error)
