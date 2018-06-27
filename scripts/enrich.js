const dsv = require('d3-dsv');
const fs = require('fs');

const INPUT = '../data/didascalies.csv';
const OUTPUT = '../data/enriched.csv'

const data = dsv.csvParse(fs.readFileSync(INPUT, 'utf8'));

const exclamRE = /«\s?(.*)\s?»/gi;

const enriched = data.map(datum => {
  // extract exclamations
  const didasc = datum.didascalie;
  let hasExclamation;
  if (didasc.match(exclamRE)) {
    const exp = exclamRE.exec(didasc)[1].trim();
    hasExclamation = true;
    datum['exclamation'] = exp;
  }
  // applaudes
  if (didasc.toLowerCase().indexOf('applaud')) {
    hasExclamation = true;
    datum['applaudi'] = 'oui';
  }
  return datum;
});

fs.writeFileSync(OUTPUT, dsv.csvFormat(enriched), 'utf8');