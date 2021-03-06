const dsv = require('d3-dsv');
const collections = require('d3-collection');
const extra = require('fs-extra');
const fs = require('fs');

const DATA_FOLDER = '../data/';
const INPUT_DIDASCALIES = `${DATA_FOLDER}didascalies.csv`;
const INPUT_INTERVENTIONS = `${DATA_FOLDER}interventions.csv`;

const didascalies = dsv.csvParse(fs.readFileSync(INPUT_DIDASCALIES, 'utf8'));
const interventions = dsv.csvParse(fs.readFileSync(INPUT_INTERVENTIONS, 'utf8'));

const GROUPS = [
    ['LREM', ['larem', 'lrem', 'rem'], 'en marche'],
    ['MODEM', ['modem'], 'mouvement démocrate'],
    ['LR', ['lr'], 'républicains'],
    ['LFI', ['lfi', 'fi'], 'insoumise'],
    ['UAI', ['udi', 'lc', 'uai'], 'constructifs'],
    ['NG', ['ng'], 'nouvelle gauche'],
    ['GDR', ['gdr'], 'gauche démocrate'],
    ['NI', ['ni'], 'non inscrit']
];

const extractGroups = function(i) {
  const groups = {}
  GROUPS.forEach(x => {
    if (i.match(new RegExp(x[2], "i")))
      return groups[x[0]] = true;
    x[1].forEach(y => {
      if (i.match(new RegExp("\\b" + y + "\\b", "i")))
        return groups[x[0]] = true;
    });
  });
  return Object.keys(groups);
};

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
    let groupes = [];
    if (line.fonction.trim() !== '' && line.nom === 'NULL') {
      if (line.fonction.split(',')[0].trim().match(/^présidente?$/i)) {
        groupes.push('présidence');
      } else {
        groupes.push('commission');
      }
    } else if (line.parlementaire === 'NULL') {
      if (line.nom.match(/groupe/i)) {
        groupes = extractGroups(line.nom);
      } else {
        groupes.push('gouvernement');
      }
    } else {
      groupes.push(normalizeGroupName(line.parlementaire_groupe_acronyme));
    }
    return result.concat(
      Object.assign({}, line, {
        type: 'elocution',
        groupes: groupes
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
