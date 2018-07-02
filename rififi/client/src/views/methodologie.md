## Récolte des données

Nous avons extrait tous les compte-rendus des séances de l'assemblée pour la 15ème législature (exemple : http://www.assemblee-nationale.fr/15/cri/2017-2018/20180285.asp#P1348032) et les avons traduits en un dataset tabulaire.

On obtient la liste de toutes les élocutions mais aussi des didascalies qui se distinguent par le fait qu'elles ne sont pas associées à un nom d'orateur.

## Préparation des données

Il s'agit ensuite de séparer les didascalies relevant de l'activité des députés des didascalies techniques ou protocolaires (e.g. "ouverture de la séance", "l'amendement est adopté"). Pour faice cela, on a filtré tous les termes techniques de type "amendement", "loi", "projet", ...

On a dédoublé les doubles discalies en découpants par tirets courts et cadratins, et on a résolu les références inter-didascalies qui désignent la didascalie précédente (par exemple : "applaudissements sur les mêmes bancs").

On a enfin jointé les didascalies avec leur contexte (à quelle élocution font-elles écho), et jointé les informations sur les députés avec les données du site nosdeputes.fr, afin de disposer par exemple de leur circonscription, de leur place dans l'assemblée, etc.

## Enrichissement des données

On a pratiqué une analyse basique sur chaque entrée de compte-rendu ainsi structurée, de manière à les qualifier selon plusieurs caractéristiques :

* dans les interventions, séparer les "invectives" des discours solennels en récupérant les entrées de moins de 30 mots contenant un point d'exclamation ou d'interrogation. À l'intérieur de ces invectives, distinguer les invectives positives ("Bravo", "Très bien") des autres que l'on considère comme négatives, à l'aide de termes repérés par analyse manuelle récursive.
* dans les didascalies, tenter de déterminer le ton ("positif" ou "négatif") des réactions enregistrées en fonction d'une série de termes cherchés dans la didascalie (e.g. "applaud" > didascalie positive, "exclam" > didascalie négative)

On a par ailleurs tenté d'établir un profil pour les orateurs participant aux débats :

* quantité d'attaques reçues : quand l'intervention d'un député est suivie de didascalies négatives (e.g. "exclamations") ou d'invectives de désapprobation (e.g. "c'est faux !")
* quantité de soutiens reçus : quand l'intervention d'un député est suivie de didascalies positives (e.g. "applaudissements") ou de messages d'encouragement ou d'approbation
* invectivité : nombre d'invectives faites par le député

Pour les métriques d'attaques et de soutiens, chaque réaction est pondérée en fonction du nombre de groupes politiques impliqués dans la réaction.

## Construction d'une application d'exploration

On a construit une interface centrée sur deux axes scientifiques :

* l'analyse des dynamiques de débats
* l'analyse des profils d'orateurs, leur "rôle" dans le théâtre de l'hémicycle et leurs relations avec leurs collègues

# Ce qui pourrait être continué

## Consolidation et enrichissement des données

* qualifier de manière plus fine les invectives positives et négatives
* récupérer les didascalies de "scénographie" (entrées et sorties dans l'assemblée) et repérer les suspensions de séances

## Consolidation des indicateurs

* soutiens et attaques reçus : regarder au-delà de l'entrée de compte-rendu suivant directement les interventions d'un député ; pondérer les didascalies et les invectives de manière différenciée

