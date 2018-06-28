#!/bin/bash

for LEG in 13 14 15; do
  cat scripts/extract_rich_interventions_from_ND.sql | mysql -u nosdeputes$LEG -p nosdeputes$LEG > data/ND${LEG}_interventions_hemicycle_rich.tsv
  python scripts/clean_didascalies.py data/ND${LEG}_interventions_hemicycle_rich.tsv $LEG
done
