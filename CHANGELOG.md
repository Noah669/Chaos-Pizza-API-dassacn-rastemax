# Journal des Modifications (Changelog)

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère au [Versionnement Sémantique (SemVer)](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 28/03/2026

### Ajouté
- Création de `docs/performance.md` présentant les résultats du test de charge.
- Création du dossier `docs/adr/` documentant les décisions architecturales sur la concurrence.
- Nouveau code promo `STUDENT` offrant 10% de réduction.
- Gestion optimisée des stocks prenant en charge les commandes avec plusieurs pizzas différentes.

### Modifié
- Refactorisation de `src/services/orderManager.js` pour éliminer les retards artificiels (suppression du goulot d'étranglement de 300ms).
- Amélioration de la sécurité de la base de données avec l'implémentation de requêtes SQL paramétrées.
- Mise en place d'une gestion de transactions sérialisées pour garantir l'intégrité des données sous forte charge.
- Modernisation du code (utilisation de `const`/`let` et des boucles for...of).

### Corrigé
- Correction des conditions de concurrence critiques dans la mise à jour des stocks qui permettaient des stocks négatifs.
- Correction d'un bug où seul le stock du premier produit d'une commande était mis à jour.
- Suppression des vulnérabilités d'injection SQL lors de la création de commandes.
- Stabilisation de l'API lors des pics de charge ("rush").

## [1.0.0] - État Initial
- Structure désorganisée, délais artificiels et bugs critiques de concurrence.
