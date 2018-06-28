#!/usr/bin/env python

import os, sys, re, csv
from fog.key import fingerprint

# Params
DATA = sys.argv[1]
LEG = sys.argv[2]
OUTPUT = os.path.join('data', 'L%s-didascalies.csv' % LEG)

# Match for "group"
GROUPS = [
    ('LREM', ('larem', 'lrem', 'rem'), 'en marche'),
    ('MODEM', ('modem', ), 'mouvement démocrate'),
    ('LR', ('lr', ), 'républicains'),
    ('LFI', ('lfi', 'fi'), 'insoumise'),
    ('UAI', ('udi', 'lc', 'uai'), 'constructifs'),
    ('NG', ('ng', ), 'nouvelle gauche'),
    ('GDR', ('gdr', ), 'gauche démocrate'),
    ('NI', ('ni', ), 'non inscrit')
]

GROUPS = [(t, tuple(re.compile('\\b' + p + '\\b') for p in ps), e) for t, ps, e in GROUPS]

BLACK_LIST = [
    'article',
    'motion',
    'séance', # Possibilité d'étudier les suspensions via ce mot-clé
    'seance',
    'amendement',
    'projet',
    'scrutin',
    'proposition',
    'votants',
    'remplace',
    'adopté',
    'tirage au sort'
]

EXCLAMATION_RE = re.compile('«([^»]+)»')
HYPHENS_RE = re.compile('[\\-‐‒–—―−‑⁃]')
QUOTES_RE = re.compile('[«»]')
DIDASCALIES_SPLITTER_RE = re.compile('[.\s]-')

# Helpers
TAGS_RE = re.compile(r'<[^>]+>')

def strip_tags(html):
    return re.sub(TAGS_RE, '', html)

def is_didascalie(line):
    if line['nom'] != 'NULL' or line['parlementaire'] != 'NULL':
        return False

    raw_intervention = fingerprint(strip_tags(re.sub(QUOTES_RE, '', line['intervention'])))

    if fingerprint(re.sub(QUOTES_RE, '', line['titre'].replace(' (suite)', ''))) == raw_intervention:
        return False

    for b in BLACK_LIST:
        if b in raw_intervention:
            return False

    return True

def split_didascalies(intervention):
    intervention = strip_tags(intervention)
    intervention = re.sub(HYPHENS_RE, '-', intervention)

    return [d.strip('. ') for d in DIDASCALIES_SPLITTER_RE.split(intervention.strip('. '))]

def extract_groups(didascalie):
    raw_didascalie = didascalie.lower()

    groups = set()

    for name, patterns, expression in GROUPS:
        if expression in raw_didascalie:
            groups.add(name)

            continue

        for pattern in patterns:
            if re.search(pattern, raw_didascalie):
                groups.add(name)
                break

    return sorted(list(groups))

def find_reference_point(lines, didascalie_line, index):
    index -= 1

    while is_didascalie(lines[index]) or (lines[index]['nom'] == 'NULL' and lines[index]['parlementaire'] == 'NULL'):
        index -=1

    if lines[index]['seance_id'] != didascalie_line['seance_id']:
        print(didascalie_line)
        print(lines[index])
        print()

    return lines[index]

DIDASCALIES = []

with open(DATA, 'r') as f:
    LINES = list(csv.DictReader(f, delimiter="\t"))

    for i, line in enumerate(LINES):
        if not is_didascalie(line):
            continue

        didascalies = split_didascalies(line['intervention'])

        reference_point = find_reference_point(LINES, line, i)

        for didascalie in didascalies:
            meta = dict(reference_point)
            meta['id'] = line['id']
            meta['timestamp'] = line['timestamp']
            meta['didascalie'] = didascalie

            DIDASCALIES.append(meta)

# Handling "mêmes mouvements"
MEMES_MOUVEMENTS_RE = re.compile('mêmes?\s+mouvements?')

for i, d in enumerate(DIDASCALIES):
    if re.search(MEMES_MOUVEMENTS_RE, d['didascalie'].lower()):
        last_d = DIDASCALIES[i - 1]
        meta = dict(last_d)
        meta['didascalie'] = MEMES_MOUVEMENTS_RE.sub(d['didascalie'], last_d['didascalie'])
        DIDASCALIES[i] = meta

# Extracting groups
for d in DIDASCALIES:
    groups = extract_groups(d['didascalie'])
    d['groups'] = '|'.join(groups)

# All groups at once
ALL_GROUPS_KEY = '|'.join(g for g, _, _ in GROUPS)
for d in DIDASCALIES:
    raw_didascalie = d['didascalie'].lower()

    if 'tous les banc' in raw_didascalie or 'mmes et mm. les députés' in raw_didascalie:
        d['groups'] = ALL_GROUPS_KEY

# Handling "mêmes bancs"
MEMES_BANCS_RE = re.compile('mêmes?\s+bancs?')

for i, d in enumerate(DIDASCALIES):
    raw_didascalie = d['didascalie'].lower()

    if re.search(MEMES_BANCS_RE, raw_didascalie):
        last_d = DIDASCALIES[i - 1]

        groups = set(d['groups'].split('|') if d['groups'] else []) | set(last_d['groups'].split('|') if last_d['groups'] else [])

        d['groups'] = '|'.join(groups)

# Normalizing `parlementaire_groupe_acronyme`
for d in DIDASCALIES:
    g = d['parlementaire_groupe_acronyme']
    g = 'UAI' if g == 'LC' else g

    d['parlementaire_groupe_norme'] = g

# Adding tonality marker
POSITIVE_KEY_WORDS = [
  'applaud',
  'sourir',
  'oui',
  'approb',
  'approuv',
  'rir',
  'assentiment'
];

NEGATIVE_KEY_WORDS = [
  'protest',
  'non',
  'exclam',
  'rappel au règlement',
  'rappels au règlement',
  'interrupt',
  'scandal',
  'oh',
  'dénégat',
  'faux',
  'stop',
  'hué',
  'brouhaha',
  'sifflement',
  'tumult'
];

for d in DIDASCALIES:
  didasc = d['didascalie']
  ton = None
  for word in POSITIVE_KEY_WORDS:
        if (word in didasc):
            ton = 'positif'
            break

  for word in NEGATIVE_KEY_WORDS:
        if (word in didasc):
            ton = 'negatif'
            break

  if (ton is None):
    ton = 'neutre'
  d['ton'] = ton

with open(OUTPUT, 'w') as f:
    writer = csv.DictWriter(f, fieldnames=list(DIDASCALIES[0].keys()))
    writer.writeheader()

    for d in DIDASCALIES:
        writer.writerow(d)
print('written at', OUTPUT)

# Sanity test
for d in DIDASCALIES:
    if d['nom'] == 'NULL' and d['parlementaire'] == 'NULL':
        print(d['intervention'])

assert(sum(int(d['nom'] == 'NULL' and d['parlementaire'] == 'NULL') for d in DIDASCALIES) == 0)
