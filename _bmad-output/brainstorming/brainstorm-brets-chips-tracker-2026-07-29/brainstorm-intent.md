# Brets Chips Tracker

*Une web app/PWA locale pour collectionner les saveurs de chips Brets déjà goûtées.*

## Contexte / objectif
Créer un petit produit fun, personnel ou entre amis, pour suivre simplement les saveurs de chips Brets déjà goûtées et nourrir une logique de collection/completion.

## Périmètre MVP confirmé
- Catalogue complet des saveurs de chips Brets, géré et livré par l’application
- Case à cocher « goûté / pas goûté » par utilisateur
- Stockage 100 % local sur l’appareil (local storage), sans backend ni base de données
- Pure web app installable en PWA, utilisable sur mobile

## Hors périmètre explicite
- Scan de code-barre, jugé overkill pour le MVP
- Ajout manuel d’une nouvelle saveur par l’utilisateur

## Idées différées après MVP
- Notation par saveur
- Commentaire par saveur

## Tension de conception résolue
Le besoin est de conserver un stockage local tout en gardant un catalogue de saveurs à jour. La solution retenue est :
- un catalogue de saveurs sous forme de fichier JSON statique livré avec l’application
- un état « goûté » persistant en local storage sur l’appareil de l’utilisateur

## Direction visuelle / UX (pistes non engageantes)
- Interface en grille, esprit bingo / pokédex
- Les saveurs discontinuées ou limitées restent visibles avec un badge visuel « archivée » plutôt que d’être supprimées

## Philosophie produit
Petit projet léger et amusant, pensé pour un usage perso ou entre amis. Pas d’ambition de scalabilité, pas de partage social des données entre utilisateurs.
