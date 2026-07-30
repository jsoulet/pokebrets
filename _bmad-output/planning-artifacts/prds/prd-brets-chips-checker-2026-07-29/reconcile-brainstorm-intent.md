# Reconciliation Analysis

**Input name:** brainstorm-intent.md

## Gaps found

1. **Modèle de livraison du catalogue non reflété / contradictoire** — La source acte un « fichier JSON statique livré avec l’application », alors que le PRD + addendum basculent vers un JSON GitHub récupéré à chaque ouverture ; la résolution de tension retenue dans l’input n’est donc pas reprise. **Source:** `brainstorm-intent.md` lignes 22-25.

2. **Philosophie “pas d’ambition de scalabilité” sous-représentée** — L’input pose explicitement une contrainte de légèreté et de non-scalabilité, mais le PRD/addendum la traduisent surtout en “pas public / pas monétisé”, sans en faire un garde-fou produit/architecture explicite. **Source:** `brainstorm-intent.md` ligne 32.

3. **Nuance “usage perso ou entre amis” affaiblie dans le cadrage utilisateur** — L’input présente le produit comme personnel *ou entre amis*, tandis que le PRD recentre les parcours sur Johan seul et parle d’« utilisateur unique par appareil », ce qui atténue ce contexte d’usage casual de petit cercle. **Source:** `brainstorm-intent.md` lignes 6 et 32.
