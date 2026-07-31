# Table de correspondance brets.fr ⇄ Open Food Facts

Ce fichier documente `scripts/off-matching-table.json` : la seule voie par
laquelle une donnée Open Food Facts (OFF) peut compléter une Saveur du
Catalogue (AD-5 — jamais une fusion automatique par similarité de nom).

## Format

```json
{
  "<id brets.fr numérique>": "<code-barres OFF>"
}
```

- La **clé** est l'`id` numérique WordPress du produit sur `cms.brets.fr`
  (visible dans la réponse de `GET /wp-json/wp/v2/product`, champ `id`).
- La **valeur** est le `code` (code-barres EAN) du produit correspondant sur
  Open Food Facts (visible dans la réponse de
  `GET https://world.openfoodfacts.org/api/v2/search?brands_tags=brets...`,
  champ `code`).

## Quand ajouter une entrée

Uniquement quand une donnée nécessaire (nom, image) est **absente** de
brets.fr pour une Saveur donnée, et qu'un produit OFF correspondant a été
identifié **manuellement** (jamais par un script de rapprochement automatique
par proximité de texte). brets.fr reste autoritaire sur toute donnée qu'il
fournit déjà : une entrée dans cette table ne sert qu'à combler un champ
manquant, jamais à remplacer une donnée brets.fr existante.

À la création de la story 1.9, cette table est vide (`{}`) : brets.fr fournit
nom et image pour la totalité des Saveurs connues, aucune entrée n'est donc
nécessaire pour l'instant.
