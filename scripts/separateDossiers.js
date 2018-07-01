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
const OUTPUT_FOLDER = path.resolve(__dirname + '/../rififi/client/data/');

const allOrateurs = [];

const dossiersMap = dsv.tsvParse(fs.readFileSync(`${DATA_FOLDER}/dossiers_ids.tsv`, 'utf8'))
  .filter(d => d.nb_interventions > 10)
  .reduce((result, obj) => {
    return Object.assign(result, { 
      [obj.titre]: 
      obj.id_dossier_an.replace("NULL", "") || null 
    })
  }, {});

const POSITIVE_EXP = [
'oui', 
'très bien', 
'bravo', 
'parfait', 
'félicitations', 
'exact', 
'tout à fait',
'très juste',
'excellent',
'c\'est vrai',
'raison',
'très juste',
'absolument',
'voilà'
];

const MURMURES_EXP = ['murmur']
const RIRES_EXP = ['rire', 'sourir'];

const getTonFromInterv = str => {
  const strS = str.toLowerCase();
  if (POSITIVE_EXP.find(exp => strS.indexOf(exp) > -1)) {
    return 'positif';
  }
  return 'negatif';
}

const getOrateursData = (curSeance, orateursMap, nameAccessor) => {
  return Object.keys(orateursMap)
    .map(nom => {
      const count = orateursMap[nom];
      const int = curSeance.interventions
        .map((d, index) => ({...d, index}))
        .filter(d => d.type !== 'didascalie' && d[nameAccessor] === nom);
      const stats = {
        attaques_recues: 0,
        invectivite: 0,
        soutiens_recus: 0,
        mots_prononces: 0
      }

      int.forEach((intervention) => {
        stats.mots_prononces += intervention.nb_mots;
        if (intervention.interruption) {
          stats.invectivite ++;
        }
        const next = intervention.index < curSeance.interventions.length - 1 && curSeance.interventions[intervention.index + 1];
        if (next) {
          if ((next.type === 'elocution' && next.interruption) || next.type === 'didascalie' ){
            if (next.ton === 'negatif') {
              // on module l'attaque ou le soutien reçu par le nombre de groupes soutenant
              stats.attaques_recues += 1 + Math.pow(next.groupes.length, 2) / 5;
            }
            stats.soutiens_recus += 1 + Math.pow(next.groupes.length, 2) /5;
          }
        }
      });

      return {
        nom,
        count,
        // int,
        groupes: int[0] ? int[0].groupes : [],
        stats,
      }
    })
}


const addSeance = function(seances, s) {
  s.pc_interruptions = s.nb_interruptions / s.interventions.length;
  s.interventions.forEach((interv, idx) => {
    let mini = Math.max(0, idx - 10),
      maxi = Math.min(s.interventions.length, idx + 11),
      slice = s.interventions.slice(mini, maxi);
    interv.animation_rate = slice.reduce((res, i) => res + i.interruption, 0) / slice.reduce((res, i) => res + i.nb_mots, 0);
  });
  seances.push(s);
};

fs.ensureDir(`${OUTPUT_FOLDER}/dossiers`)
  .then(() => fs.readFile(`${DATA_FOLDER}/dossiers.json`))
  .then(dossiers => Promise.all(
    JSON.parse(dossiers)
    .filter(dossier => dossiersMap[dossier.key] !== undefined)
    .map((dossier, dossierIndex) => {
      const nom = slugify(dossier.key);
      const filename = `${OUTPUT_FOLDER}/dossiers/${nom}.json`;
      console.log('processing', nom, `${(dossierIndex + 1)}/${Object.keys(dossiersMap).length}`, (((dossierIndex + 1) / Object.keys(dossiersMap).length) * 100) + '%');
      let seances = [];
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
            nb_interruptions_positives: 0,
            nb_interruptions_negatives: 0,
            pc_interruptions: 0,
            nb_didasc_positives: 0,
            nb_didasc_negatives: 0,
            nb_didasc_neutres: 0,
            nb_murmures: 0,
            nb_rires: 0,
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
          let clinterv = i["intervention"].replace(/<([^>]+)>/g, ''),
            phrases = sentences(clinterv);
          i.nb_cars = clinterv.length;
          i.nb_mots = words(clinterv).length;
          i.nb_excl = (clinterv.match(/\!/g) || []).length;
          i.nb_qust = (clinterv.match(/\?/g) || []).length;
          i.nb_phrs = phrases.length;
          i.nb_mwbp = i.nb_cars / i.nb_phrs;
          i.interruption = (i.nb_mots < 20 && i.nb_excl > 0);
          if (i.interruption) {
            i.ton = getTonFromInterv(clinterv);
            if (i.ton === 'positif') {
              curSeance.nb_interruptions_positives ++;
            } else {
              curSeance.nb_interruptions_negatives ++;
            }
          }
          if (MURMURES_EXP.find(exp => clinterv.toLowerCase().indexOf(exp)) !== undefined) {
            curSeance.nb_murmures ++;
          }
          if (RIRES_EXP.find(exp => clinterv.toLowerCase().indexOf(exp)) !== undefined) {
            curSeance.nb_rires ++;
          }
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

      seances = seances.map(curSeance => Object.assign(curSeance, {
        orateursData: [
          ...getOrateursData(curSeance, curSeance.parlementaires || {}, 'parlementaire'),
          ...getOrateursData(curSeance, curSeance.personnalites || {}, 'nom'),
        ].sort((a, b) => {
          if (a.count > b.count)
              return -1;
          return 1;
        })
        .reduce((res, parl) => Object.assign(res, {[parl.nom]: parl}), {})
      }));

      const parlementaires = merge(seances, 'parlementaires');
      const personnalites = merge(seances, 'personalites');
      const orateursMerged = seances.reduce((res, seance) => {
        return Object.keys(seance.orateursData).reduce((res2, orNom) => {
          const existing = res2[orNom];
          const current = seance.orateursData[orNom];
          if (existing) {
            return Object.assign(res2, {
              [orNom]: Object.assign(existing, {
                count: existing.count + current.count,
                stats: Object.keys(existing.stats).reduce((stats, statKey) => {
                  return Object.assign(stats, {
                    [statKey]: existing.stats[statKey] + current.stats[statKey]
                  })
                }, {})
              })
            })
          }
          return Object.assign(res2, {[orNom]: current})
        }, res)
      }, {});
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

        nb_orateurs: Object.keys(parlementaires).length + Object.keys(personnalites).length,

        nb_didasc_neutres: sum(seances, 'nb_didasc_neutres'),
        nb_didasc_positives: sum(seances, 'nb_didasc_positives'),
        nb_didasc_negatives: sum(seances, 'nb_didasc_negatives'),
        nb_interruptions: sum(seances, 'nb_interruptions'),
        nb_interruptions_positives: sum(seances, 'nb_interruptions_positives'),
        nb_interruptions_negatives: sum(seances, 'nb_interruptions_negatives'),
        nb_murmures: sum(seances, 'nb_murmures'),
        nb_rires: sum(seances, 'nb_rires'),
        profile_interruptions: seances.map(s => s.pc_interruptions),
        // mean of nb interruptions
        pc_interruptions: seances.reduce((sum, s) => sum + s.pc_interruptions , 0) / seances.length,
        nb_interv: total_interv,
        orateurs: orateursMerged
      };
      dossiersMap[dossier.key] = dos;
      dos.nb_seances = dos.seances.length;
      // writing full data file
      fs.writeFileSync(filename, JSON.stringify(dos), 'utf8');
      allOrateurs.push(Object.assign({}, dos.orateurs));
      // deleting heavy props for list data
      delete dos.seances;
      delete dos.orateurs;
    })
  ))
  .then(() => {
    console.log('writing orateurs');
    const orateursMerged = allOrateurs.reduce((res, orateurs) => {
        return Object.keys(orateurs).reduce((res2, orNom) => {
          const existing = res2[orNom];
          const current = orateurs[orNom];
          if (existing) {
            return Object.assign(res2, {
              [orNom]: Object.assign(existing, {
                count: existing.count + current.count,
                stats: Object.keys(existing.stats).reduce((stats, statKey) => {
                  return Object.assign(stats, {
                    [statKey]: existing.stats[statKey] + current.stats[statKey]
                  })
                }, {})
              })
            })
          }
          return Object.assign(res2, {[orNom]: current})
        }, res)
      }, {});
      return fs.writeFile(`${OUTPUT_FOLDER}/orateurs.json`, JSON.stringify(orateursMerged), 'utf8')
  })
  .then(() => {
    const liste = `${OUTPUT_FOLDER}/liste_dossiers.json`
    console.log('writing', liste);
    return fs.writeFile(liste, JSON.stringify(dossiersMap), 'utf8')
  })
  .catch(console.error)
