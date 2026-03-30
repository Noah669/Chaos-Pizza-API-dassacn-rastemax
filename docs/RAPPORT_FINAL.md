# Rapport Final : Montée en Charge et Release - Chaos Pizza API

**Étudiants :** Maxime Rastelli & Noah Dassac  
**Projet :** API Chaos Pizza - Maintenance et Scalabilité  
**Lien GitHub :** [https://github.com/Noah669/Chaos-Pizza-API-dassacn-rastemax](https://github.com/Noah669/Chaos-Pizza-API-dassacn-rastemax)

---

## Introduction et Objectifs
L'objectif de ce projet était de transformer une API "legacy" instable et lente en une solution robuste, sécurisée et capable de supporter un flux important de commandes (jusqu'à 40 requêtes/seconde).

## Travail Réalisé

### 1. Refactorisation et Qualité du Code
Le code initial a été entièrement restructuré suivant une architecture propre (`src/controllers`, `src/services`, `src/models`). 
- **Modernisation** : Passage de `var` à `const`/`let`, utilisation de boucles modernes et retrait du "Callback Hell".
- **Nettoyage** : Suppression des délais artificiels (300ms) et des variables inutilisées.

### 2. Optimisation des Performances et Scalabilité
Grâce à l'outil **Artillery**, nous avons identifié et corrigé les goulots d'étranglement :
- **Avant** : Latence moyenne de **308 ms** par commande.
- **Après** : Latence moyenne de **4.6 ms**.
- **Résultat** : Une amélioration de **98%** de la rapidité de traitement de l'API.

### 3. Gestion de la Concurrence et Sécurité
C'est le cœur technique du projet :
- **Transactions Atomiques** : Implémentation de `BEGIN IMMEDIATE TRANSACTION` pour éviter les accès concurrents désordonnés sur SQLite.
- **Protection des Stocks** : Verrouillage logique via des requêtes `UPDATE ... WHERE stock >= qty` empêchant les stocks négatifs.
- **Sécurité SQL** : Protection totale contre les injections SQL via des requêtes paramétrées.

### 4. Automatisation et Release
- **CI/CD** : Mise en place d'un fichier `.gitlab-ci.yml` gérant le build, les tests et l'analyse **SonarQube**.
- **Traçabilité** : Versionnement sémantique (**v1.1.0**) et création d'un **CHANGELOG.md**.

---

## Documentation Détaillée (Dossier `/docs`)
Pour plus de détails techniques, consultez les fichiers suivants dans le dépôt GitHub :

1.  **`docs/performance.md`** : Rapport complet des tests de charge et métriques (p95, p99).
2.  **`docs/adr/gestion-concurrence.md`** : Dossier de décisions architecturales expliquant nos choix techniques.
3.  **`docs/BILAN.md`** : Analyse critique du projet et retour d'expérience.

---

## Conclusion
L'API Chaos Pizza est désormais **stable**, **sécurisée** et **performante**. Elle passe avec succès le contrôle qualité (Quality Gate) et est prête pour un environnement de production réel.
