# Glossaire — Crounch

- **Saveur** — Une variante de goût de chips Brets (ex: "Barbecue", "Crème & Ciboulette"). Identifiée de façon unique dans le Catalogue par un identifiant stable.
- **Catalogue** — La liste complète des Saveurs existantes, avec leurs métadonnées (nom, visuel, statut). Fichier JSON hébergé sur GitHub, récupéré par l'app à chaque ouverture.
- **État de dégustation** — Pour une Saveur et un Appareil donnés, indicateur binaire "goûtée" / "pas goûtée". Stocké en Stockage local, propre à chaque Appareil, sans synchronisation entre appareils.
- **Appareil** — Le terminal (téléphone, ordinateur) sur lequel l'app est utilisée. Chaque Appareil a son propre État de dégustation, indépendant des autres.
- **Stockage local** — Mécanisme de persistance navigateur (local storage), sans backend ni base de données.
- **Saveur archivée** — Une Saveur qui n'est plus produite/disponible (édition limitée terminée, arrêt de production). Reste visible dans le Catalogue avec un statut visuel distinct, jamais supprimée.
- **Outil de mise à jour du Catalogue** — Script/outil (hors app utilisateur final) permettant au mainteneur de scraper les données de saveurs et de régénérer le fichier JSON du Catalogue.
