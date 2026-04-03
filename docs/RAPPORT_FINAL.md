# Rapport Final : Montée en Charge et Release - Chaos Pizza API

**Étudiants :** Maxime Rastelli & Noah Dassac  
**Projet :** API Chaos Pizza - Maintenance et Scalabilité  
**Version :** 1.1.0  
**Date :** 02/04/2026  
**Lien GitHub :** [https://github.com/Noah669/Chaos-Pizza-API-dassacn-rastemax](https://github.com/Noah669/Chaos-Pizza-API-dassacn-rastemax)

---

## Introduction et Objectifs

L'objectif de ce projet était de transformer une API "legacy" instable et lente en une solution robuste, sécurisée et capable de supporter un flux important de commandes (jusqu'à 40 requêtes/seconde).

---

## Travail Réalisé

### 1. Refactorisation et Qualité du Code

Le code initial a été entièrement restructuré suivant une architecture en couches (`src/controllers`, `src/services`, `src/models`, `src/utils`, `src/config`) — voir ADR 02.

- **Modernisation** : Passage de `var` à `const`/`let`, utilisation de boucles modernes et retrait du « Callback Hell ».
- **Nettoyage** : Suppression des délais artificiels (300 ms) et des variables inutilisées.
- **Séparation frontend** : Extraction de tout le JavaScript inline du HTML vers des fichiers `.js` dédiés dans `public/`.

### 2. Optimisation des Performances et Scalabilité

Grâce à l'outil **Artillery**, nous avons identifié et corrigé les goulots d'étranglement :

| Métrique       | Avant       | Après       | Gain    |
|----------------|-------------|-------------|---------|
| Latence moyenne | 308.5 ms   | 4.6 ms      | −98%    |
| Latence p95    | 314.2 ms   | 7.9 ms      | −97.5%  |
| Latence p99    | 327.1 ms   | 10.1 ms     | −96.9%  |
| Cohérence stock | ❌ ÉCHEC   | ✅ RÉUSSITE | —       |

### 3. Gestion de la Concurrence et Sécurité

C'est le cœur technique du projet (voir ADR 01) :

- **Transactions Atomiques** : Implémentation de `BEGIN IMMEDIATE TRANSACTION` pour éviter les accès concurrents désordonnés sur SQLite.
- **Protection des Stocks** : Verrouillage logique via des requêtes `UPDATE ... WHERE stock >= qty` empêchant les stocks négatifs.
- **Promise Queue** : Sérialisation des créations de commandes pour éliminer les erreurs `SQLITE_BUSY`.
- **Sécurité SQL** : Protection totale contre les injections SQL via des requêtes paramétrées.

### 4. Traçabilité Client

Ajout de fonctionnalités métier supplémentaires :

- **Enregistrement de l'email** : Chaque commande requiert désormais une adresse email, persistée dans la base de données.
- **Nouvelle route** : `GET /orders/user/:email` permet de consulter l'historique complet d'un client.
- **Interface mise à jour** : Le formulaire de commande dans `public/index.html` intègre le champ email avec validation.

### 5. Tests et Couverture de Code

L'API est couverte par **23 tests automatisés** répartis en 3 suites (Jest + Supertest) :

| Suite               | Type        | Tests | Résultat |
|---------------------|-------------|:-----:|:--------:|
| `pizza.test.js`     | Unitaire    | 3     | ✅ PASS  |
| `utils.test.js`     | Unitaire    | 7     | ✅ PASS  |
| `orders.test.js`    | Intégration | 13    | ✅ PASS  |
| **Total**           |             | **23** | **✅ 100% PASS** |

**Résultats de couverture** (`npm run test:coverage`) :

| Métrique      | Résultat   | Seuil  | Statut |
|---------------|:----------:|:------:|:------:|
| Statements    | **86.06%** | 80%    | ✅     |
| Lines         | **91.83%** | 80%    | ✅     |
| Functions     | **94.44%** | 80%    | ✅     |
| Branches      | **72.72%** | —      | ⚠️     |

> Les branches non couvertes correspondent à des cas d'erreurs internes de SQLite intentionnellement difficiles à simuler (rollback en cas de corruption, erreurs du driver). La couverture fonctionnelle et métier est complète.

### 6. Automatisation et Release

- **CI/CD** : Pipeline `.gitlab-ci.yml` gérant le build, les tests, la couverture et l'analyse **SonarQube Cloud**.
- **Traçabilité** : Versionnement sémantique (**v1.1.0**) et **CHANGELOG.md** tenu à jour.
- **Quality Gate SonarQube** : Passé avec succès (couverture > 80%, zéro bug bloquant).

---

## Documentation Détaillée (Dossier `/docs`)

Pour plus de détails techniques, consultez les fichiers suivants dans le dépôt GitHub :

1. **`docs/performance.md`** : Rapport complet des tests de charge et métriques (p95, p99).
2. **`docs/TESTS_ET_COUVERTURE.md`** : Documentation des tests unitaires/intégration et de la couverture de code (≥ 80%).
3. **`docs/adr/gestion-concurrence.md`** : ADR 01 — Décision architecturale sur la gestion des transactions SQLite.
4. **`docs/adr/Structuration-Et-Separation-code.md`** : ADR 02 — Décision sur l'architecture en couches et la séparation HTML/JS.
5. **`docs/BILAN.md`** : Analyse critique du projet et retour d'expérience.
6. **`docs/CHANGELOG.md`** : Historique complet des modifications.

---

## Conclusion

L'API Chaos Pizza est désormais **stable**, **sécurisée** et **performante**. Elle passe avec succès le Quality Gate SonarQube (couverture ≥ 80%, zéro vulnérabilité critique) et est prête pour un environnement de production réel. La latence a été réduite de **98%**, les conditions de concurrence ont été éliminées, et une suite de tests complète garantit la non-régression lors des évolutions futures.
