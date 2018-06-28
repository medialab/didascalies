const dsv = require('d3-dsv');
const collections = require('d3-collection');
const extra = require('fs-extra');
const fs = require('fs');

const DATA_FOLDER = '../data/';
const INPUT_DIDASCALIES = `${DATA_FOLDER}didascalies.csv`;
const INPUT_INTERVENTIONS = `${DATA_FOLDER}interventions.csv`;

const didascalies = dsv.csvParse(fs.readFileSync(INPUT_DIDASCALIES, 'utf8'));
const interventions = dsv.csvParse(fs.readFileSync(INPUT_INTERVENTIONS, 'utf8'));

function normalizeGroupName (name) {
  if (name === 'LC') {
    return 'UAI';
  }
  return name;
}

const didMap = didascalies.reduce((result, did) => {
  return Object.assign(result, {
    // storing in arrays because of duplicate ids (splitted didascalies)
    [did.id]: result[did.id] ? result[did.id].concat(did) : [did]
  });
}, {});
console.log('done for map');

const interventionsEnriched = interventions.reduce((result, line, index) => {
  const did = didMap[line.id];
  if (index%1000 === 1) {
    console.log(`${index / interventions.length * 100}%`, result.length, interventions.length);
  }
  if (did) {
    return result.concat(
      did.map(d => Object.assign({}, d, 
        {
          type: 'didascalie',
          groupes: d.groups.split('|')
        },
      ))
      )
  // filtering out technical terms
  } else if(line.parlementaire !== 'NULL' || line.nom !== 'NULL')  {
    let groupe;
    if (line.fonction.trim() !== '' && line.nom === 'NULL') {
      if (line.fonction.split(',')[0].trim().match(/^présidente?$/i)) {
        groupe = 'présidence';
      } else {
        groupe = 'commission';
      }
    } else if (line.parlementaire === 'NULL') {
      groupe = 'gouvernement';
    } else {
      groupe = normalizeGroupName(line.parlementaire_groupe_acronyme);
    }
    return result.concat(
      Object.assign({}, line, {
        type: 'elocution',
        groupes: [groupe]
      })
    )
  }
  return result;
}, []);

console.log('done enriching');

const dossiers = collections.nest()
                  .key(d => d.titre_complet.split('>')[0].trim().toLowerCase())
                  .entries(interventionsEnriched);

console.log('done nesting');

console.log('writing dossiers.json');
fs.writeFileSync(`${DATA_FOLDER}dossiers.json`, JSON.stringify(dossiers), 'utf8')
