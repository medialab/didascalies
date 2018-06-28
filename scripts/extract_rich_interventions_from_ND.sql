SELECT i.id, i.seance_id, i.date, s.moment, i.type, se.titre, se.titre_complet, i.timestamp, i.intervention, i.nb_mots, pe.nom, pa.nom as parlementaire, pa.sexe, i.parlementaire_groupe_acronyme, i.fonction, i.source
FROM intervention i
LEFT JOIN seance s ON s.id = i.seance_id
LEFT JOIN section se ON se.id = i.section_id
LEFT JOIN parlementaire pa ON pa.id = i.parlementaire_id
LEFT JOIN personnalite pe ON pe.id = i.personnalite_id
WHERE i.type != 'commission'
ORDER BY i.date, s.moment, i.timestamp
