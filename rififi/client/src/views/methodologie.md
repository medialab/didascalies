## Récolte des données

Nous avons extrait tous les compte-rendus des séances de l'assemblée pour la 15ème législature (exemple : http://www.assemblee-nationale.fr/15/cri/2017-2018/20180285.asp#P1348032) et les avons traduits en un dataset tabulaire.

On obtient la liste de toutes les élocutions mais aussi des didascalies qui se distinguent par le fait qu'elles ne sont pas associées à un nom d'orateur.

## Préparation des données

Il s'agit ensuite de séparer les didascalies relevant de l'activité des députés des didascalies techniques ou protocolaires (e.g. "ouverture de la séance", "l'amendement est adopté"). Pour faice cela, on a filtré tous les termes techniques de type "amendement", "loi", "projet", ...

On a dédoublé les doubles discalies en découpants par tirets courts et cadratins, et on a résolu les références inter-didascalies - "même mouvement" - qui désignent la didascalie précédente (par exemple : "applaudissements sur les mêmes bancs").

## Enrichissement des données

On a pratiqué une analyse basique sur chaque entrée ainsi récoltée :

* dans les interventions, séparer les "invectives" des discours solennels en récupérant les entrées de moins de 30 mots contenant un point d'exclamation ou d'interrogation. À l'intérieur de ces invectives, distinguer les invectives positives ("Bravo", "Très bien") des autres que l'on considère comme négatives, à l'aide de termes repérés par analyse manuelle récursive.
* dans les didascalies, tenter de déterminer le ton ("positif" ou "négatif") des réactions enregistrées en fonction d'une série de termes cherchés dans la didascalie (e.g. "applaud" > didascalie positive, "exclam" > didascalie négative)

## Métriques sur les orateurs

On a tenté d'établir un profil pour les orateurs participant aux débats :

* quantité d'attaques reçues : quand l'intervention d'un député est suivie de didascalies négatives (e.g. "exclamations") ou d'invectives de désapprobation (e.g. "c'est faux !")
* quantité de soutiens reçus : quand l'intervention d'un député est suivie de didascalies positives (e.g. "applaudissements") ou de messages d'encouragement ou d'approbation
* invectivité : nombre d'invectives faites par le député

Pour les métriques d'attaques et de soutiens, chaque réaction est pondérée en fonction du nombre de groupes politiques impliqués dans la réaction.

## Construction d'une application d'exploration

On a construit une interface centrée sur deux axes :

* l'analyse des dynamiques de débats
* l'analyse des profils d'orateurs

# Ce qui pourrait être continué

## Consolidation des données

... TODO

## Consolidation des indicateurs

* soutiens et attaques reçus : regarder au-delà de l'entrée de compte-rendu suivant directement les interventions d'un député

## Pistes d'interprétation

Le site a été construit comme une interface d'exploration. Des questions de recherche telles que celles qui suivent pourraient maintenant être posées par l'analyse qualitative ou la production d'analyses à partir des agrégations :

* y a-t-il des dynamiques types pour l'animation des débats concernant des catégories de dossier données ?
* y-a-t-il des profils de députés reconnaissables (le représentant, l'attaquant, le bouc-émissaire, ...) ?


