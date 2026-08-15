# Spine Pair Review — crounch

## Overall verdict
Le pair reste lisible et bien structuré, mais il n’est plus assez fiable comme contrat canonique. Les plus gros écarts portent sur la complétude des tokens, la couverture des composants réellement livrés et plusieurs comportements/states devenus faux ou obsolètes après les derniers polishs UI.

## 1. Flow coverage — thin
J’ai extrait les parcours/références depuis les `sources:` du pair (`prd.md`, stories 2.1/2.2/2.3) puis vérifié les `Key Flows` pour protagoniste nommé, étapes numérotées, climax et cas d’échec applicables.
### Findings
- **high** `UJ-3` / `FR-5` restent dans les `sources:` mais n’ont aucun `Key Flow` dédié : la spine les évacue par une note “hors périmètre UX” au lieu d’un vrai traitement de couverture (`prd.md:30,96`; `EXPERIENCE.md:119,123`). *Fix:* soit retirer cette source du pair UX, soit expliciter formellement dans le frontmatter/overview que `FR-5` est importé pour contexte seulement et exclu de la validation de flows.
- **medium** Les flows couvrent bien le happy path principal, mais pas les échecs “applicables” déjà reconnus ailleurs dans la spine, notamment le premier lancement hors ligne et l’échec d’écriture locale (`EXPERIENCE.md:67,75,125-152`). *Fix:* ajouter au moins un flow d’échec réseau/cold start et aligner le flow d’écriture locale sur le comportement réellement implémenté.

## 2. Token completeness — broken
J’ai relevé tous les tokens YAML de `DESIGN.md`, puis toutes les références `{path.to.token}` utilisées dans `DESIGN.md` et `EXPERIENCE.md`, et j’ai vérifié leur résolution ainsi que la présence de valeurs exploitables pour les couleurs porteuses.
### Findings
- **critical** Des références de tokens utilisées dans le pair ne sont pas définies dans le frontmatter : `{colors.foreground}` et `{colors.muted}` sont consommées par `toolbar-sort-control`, `toolbar-filter-toggle` et l’icône info, mais `colors` ne déclare que `primary`, `accent`, `success`, `archived`, `background` (+ foreground pairs associés) (`DESIGN.md:8-16,85,90,112,145,151-152`). *Fix:* déclarer explicitement ces tokens dans `DESIGN.md` avec leurs valeurs réelles (ou paires light/dark si l’app les assume) au lieu de déléguer à “l’héritage shadcn”.
- **high** Les contrastes critiques sont exigés côté accessibilité (`EXPERIENCE.md:95`) mais aucune cible de contraste n’est donnée pour les combinaisons porteuses (`primary`/`primary-foreground`, `success`/badge goûtée, texte sur bandeau moutarde, badge archivé) (`DESIGN.md:105-153`). *Fix:* documenter les couples de contraste attendus et la cible minimale (AA normal/large text) pour chaque combinaison charge-bearing.
- **high** Le code dépend désormais de valeurs visuelles non tokenisées ou divergentes du spine : zigzag `#ffc602` avec trait noir, badge “Goûtée” `#8fbf98`, titre de dialog `#b5652e`, police `font-tanker` auto-hébergée (`catalogue-page-client.tsx:173,218`; `catalogue-tile.tsx:99`; `flavor-detail-dialog.tsx:65-68`; `app/layout.tsx:20-33`). *Fix:* soit ramener l’implémentation sur les tokens documentés, soit promouvoir ces valeurs en tokens nommés dans `DESIGN.md`.

## 3. Component coverage — broken
J’ai comparé les noms de composants employés dans les deux spines, leurs lignes de specs dans `DESIGN.md > Components` et `EXPERIENCE.md > Component Patterns`, puis je les ai croisés avec les composants réellement présents sous `components/catalogue/` et la chrome effective de l’app.
### Findings
- **high** Le filtre est documenté comme `Toolbar filter toggle` en mode switch binaire, alors que l’implémentation réelle est `TastedFilterControl`, un segmented control à 3 états (`Toutes` / `Goûtées` / `Non goûtées`) (`DESIGN.md:87-90,152,166`; `EXPERIENCE.md:55,148`; `components/catalogue/tasted-filter-control.tsx:18-51`). *Fix:* remplacer la spec du switch par une spec canonique du composant `TastedFilterControl`, avec ses 3 options, son nom exact et ses règles de vide associées.
- **high** La `Dialog détail` et `Button primary` sont devenus faux comme contrat de composant : le code livre un dialog restylé (kicker “Saveur”, grand titre Tanker, couleur dédiée) et un `Toggle` pilule partagé, pas un dialog shadcn “standard” avec simple bouton primary en pied (`DESIGN.md:147`; `EXPERIENCE.md:50,58`; `components/catalogue/flavor-detail-dialog.tsx:57-92`). *Fix:* réécrire la spec visuelle et comportementale du détail selon le composant réellement monté.
- **medium** Des composants visibles en production ne sont pas couverts par les spines : vraie barre de progression visuelle et footer de site global (`DESIGN.md:146`; `catalogue-page-client.tsx:183-207`; `app/layout.tsx:5,66`; `components/site-footer.tsx:6-20`). *Fix:* ajouter une ligne de composant pour la progress bar/header composite et une ligne pour `SiteFooter` (ou documenter explicitement qu’il est hors spine UX si volontaire).
- **medium** `DESIGN.md` inventorie `Toast` et `Checkbox`, mais `EXPERIENCE.md` ne leur donne pas de pattern comportemental et le code n’implémente actuellement ni toast ni checkbox UX visibles (`DESIGN.md:137`; `EXPERIENCE.md:41-59`; recherche code = aucun `Toast`/`useToast`). *Fix:* soit ajouter de vraies règles comportementales et l’implémentation correspondante, soit retirer ces composants du pair jusqu’à ce qu’ils existent.

## 4. State coverage — thin
J’ai parcouru chaque surface IA (`Catalogue`, `Dialog détail`) et comparé les états attendus pour ce produit avec `State Patterns`, puis avec les états réellement codés dans `catalogue-page-client.tsx` et les stores locaux.
### Findings
- **high** L’état “Échec d’écriture locale” est documenté avec rollback + `Toast`, mais le code réel dégrade silencieusement les écritures `localStorage` sans toast, et retourne quand même le snapshot optimiste (`EXPERIENCE.md:75`; `lib/tasted/cache.ts:67-68`; `lib/rating/cache.ts:62`; `lib/sort-preference/cache.ts:47-48`; `lib/tasted-filter/cache.ts:72`). *Fix:* soit implémenter réellement rollback + toast, soit corriger la spine pour refléter la dégradation silencieuse actuelle.
- **medium** Le passage au filtre 3 états crée un état vide supplémentaire (“Goûtées” actif alors que rien n’a encore été goûté) géré en code par `Tu n'as encore rien goûté.`, mais absent de `State Patterns` (`catalogue-page-client.tsx:269-279`; `EXPERIENCE.md:71` ne couvre que le cas “tout goûté” du filtre binaire historique). *Fix:* ajouter un état vide explicite pour `filterMode = tasted` sans résultat.
- **medium** Le pair ne documente toujours pas l’état “catalogue vide mais fetch réussi” ; il distingue seulement loading / offline with cache / offline without cache / filtered empty (`EXPERIENCE.md:65-75`). *Fix:* ajouter ou exclure explicitement l’état “0 saveur disponible” au niveau catalogue.
- **low** Les états de focus/hover des nouveaux contrôles interactifs ne sont pas couverts, alors que le code en dépend pour le feedback (hover stars, segmented pills, bouton info en sticker) (`star-rating.tsx:31-44`; `pill-button-styles.ts:1-18`; `catalogue-tile.tsx:78-85`). *Fix:* documenter au minimum focus-visible, pressed et hover pour les contrôles clés.

## 5. Visual reference coverage — adequate
J’ai listé tous les fichiers présents dans `mockups/`, `imports/` et vérifié leur citation dans les spines, leur emplacement et la précision de ce qu’ils illustrent.
### Findings
- **low** Aucun asset n’est totalement orphelin, mais plusieurs références restent vagues/non résolubles pour un parseur (`imports/brets-fr-01..06`, `DESIGN.md.Brand & Style`, `DESIGN.md.Components`) au lieu de lier un fichier précis à la décision qu’il supporte (`DESIGN.md:103`; `EXPERIENCE.md:115`). *Fix:* remplacer les plages/raccourcis par des liens fichier-par-fichier et nommer explicitement ce que chaque visuel démontre.
- **low** Les trois mockups sont bien cités, mais seulement en bloc dans l’IA ; les sections qui ont dérivé le plus (dialog détaillé, toolbar tri/filtre, header/progression) ne pointent pas directement vers le mockup concerné (`EXPERIENCE.md:27`). *Fix:* ajouter des renvois ciblés depuis les sections de composants et responsive pertinentes.

## 6. Bloat & overspecification — adequate
J’ai cherché les endroits où le pair répète la source, spécifie des détails qui devraient vivre dans les tokens, ou ajoute de la narration peu exploitable par un downstream consumer.
### Findings
- **low** Le pair reste globalement compact, mais plusieurs sections re-racontent le contexte produit au lieu de référencer la source (Brand & Style, Foundation, Inspiration) (`DESIGN.md:101-103`; `EXPERIENCE.md:14-27,113-119`). *Fix:* garder la prose qui change une décision UX et convertir le reste en références courtes au PRD.
- **low** La section `Components` mélange inventaire générique shadcn, spécs marque et décisions de placement détaillées dans une forme narrative ; une table normalisée serait plus exploitable et limiterait les dérives (`DESIGN.md:137-152`). *Fix:* passer à une structure tabulaire systématique : nom canonique, rôle, tokens, variantes, références visuelles, notes d’accessibilité.

## 7. Inheritance discipline — thin
J’ai vérifié la résolution des `sources:`, l’identité des termes entre sources/spines, la cohérence des noms de composants et la validité des références croisées `EXPERIENCE.md -> DESIGN.md`.
### Findings
- **high** La discipline de nommage n’est plus tenue entre spine et code : `Toolbar filter toggle` ≠ `TastedFilterControl`, `Toolbar sort control` ≠ `SortControl`, `Button primary` ≠ `Toggle` pilule, `display` = Post No Bills dans le spine mais `font-tanker` en code (`DESIGN.md:147,151-152`; `EXPERIENCE.md:54-58`; `sort-control.tsx:15`; `tasted-filter-control.tsx:18`; `flavor-detail-dialog.tsx:82`; `app/layout.tsx:20-33`). *Fix:* choisir des noms canoniques uniques et les propager partout.
- **medium** Les parcours ne reprennent pas les identifiants/verbatims des sources (`UJ-1`, `UJ-2`, `Story 2.1/2.2/2.3`) ; ils sont compréhensibles, mais moins traçables mécaniquement (`prd.md:28-30`; `EXPERIENCE.md:125-152`). *Fix:* préfixer les flows avec les IDs sources qu’ils couvrent.
- **medium** Les cross-refs de tokens entre EXPERIENCE et DESIGN ne sont pas entièrement fiables, car EXPERIENCE hérite indirectement de tokens non déclarés (`{colors.success}` OK, mais `{colors.foreground}` / `{colors.muted}` non définis côté DESIGN) (`DESIGN.md:85,90,112`; `EXPERIENCE.md:61-101`). *Fix:* rendre `DESIGN.md` auto-suffisant sur tous les tokens exposés.

## 8. Shape fit — adequate
J’ai vérifié l’ordre canonique des sections, la présence des sections requises par défaut et des sections déclenchées par le contexte de cette app.
### Findings
- **low** La structure macro est bonne : ordre canonique respecté dans `DESIGN.md`, sections obligatoires présentes dans `EXPERIENCE.md`, et `Responsive & Platform` / `Inspiration & Anti-patterns` sont bien incluses. Le problème est surtout la fraîcheur du contenu responsive, pas la forme (`DESIGN.md:101-154`; `EXPERIENCE.md:14-121`). *Fix:* conserver la structure mais remettre `Responsive & Platform` à jour avec les breakpoints réellement livrés.
- **medium** `Responsive & Platform` est désormais factuellement en retard sur l’implémentation : la spine annonce `4-5` colonnes en `md` et `6+` en `lg`, alors que la grille réelle plafonne à `2 / 3 / 4` colonnes avec espacements précis et même le skeleton suit une autre matrice (`EXPERIENCE.md:107-109`; `catalogue-grid.tsx:4,30`; `catalogue-grid-skeleton.tsx:11`). *Fix:* synchroniser les breakpoints et densités avec le code ou les mocks actuels.

## Mechanical notes
- Les `sources:` des deux spines pointent bien vers des fichiers existants.
- Référence non résoluble pour un outil mécanique : `imports/brets-fr-01..06` n’est pas un vrai chemin de fichier.
- Le littéral d’exemple `"Noter {n} étoiles sur 5"` dans `EXPERIENCE.md` ressemble à une référence de token et sera extrait à tort comme `{n}` par un walker naïf ; l’échapper ou le reformuler éviterait ce faux positif.
- Pas de Mermaid détecté dans les deux spines.
