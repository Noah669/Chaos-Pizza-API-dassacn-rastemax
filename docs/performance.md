# Analyse de Performance

Cette documentation présente les résultats des tests de charge effectués sur l'API Chaos Pizza.

## Baseline (État Initial)

Les tests de charge initiaux (100 commandes, 20 requêtes par seconde) ont révélé des problèmes majeurs de performance.

| Métrique | Résultat |
| --- | --- |
| Total des requêtes | 100 |
| Latence moyenne | 308.5 ms |
| Latence p95 | 314.2 ms |
| Latence p99 | 327.1 ms |
| Erreurs (vusers.failed) | 0 |
| Cohérence des données | **ÉCHEC** (Le stock est devenu erroné à cause de conditions de concurrence) |

### Identification des problèmes

1.  **Latence Artificielle** : Présence d'un `setTimeout(..., 300)` dans le service de création de commande, ralentissant artificiellement chaque requête de 300ms.
2.  **Conditions de Concurrence** : Les mises à jour de stock n'étaient pas atomiques (exécution manuelle d'un `SELECT` suivi d'un `UPDATE`). Sous charge, les requêtes concurrentes lisaient la même valeur de stock et s'écrasaient mutuellement.
3.  **Absence de Transactions** : L'insertion de commande et la mise à jour des stocks étaient effectuées de manière séparée.
4.  **Vulnérabilité SQL** : La concaténation dans les requêtes SQL permettait l'injection SQL.

---

## Post-Optimisation (Après Correction)

Résultats après suppression des délais et implémentation de transactions sérialisées.

| Métrique | Résultat |
| --- | --- |
| Total des requêtes | 100 |
| Latency moyenne | **4.6 ms** (contre 308.5 ms) |
| Latency p95 | **7.9 ms** (contre 314.2 ms) |
| Latency p99 | **10.1 ms** (contre 327.1 ms) |
| Succès (200) | 50 (Stock limite atteint) |
| Refus (400) | 50 (Protection du stock efficace) |
| Cohérence des données | **RÉUSSITE** (Le stock ne devient jamais négatif) |

### Améliorations Apportées

1.  **Suppression du Délai Artificiel** : Élimination du `setTimeout` qui pénalisait massivement les performances.
2.  **Mises à jour Atomiques** : Utilisation d'une requête unique `UPDATE ... WHERE stock >= qty`.
3.  **Transactions Sérialisées** : Implémentation d'une file d'attente (Promise Queue) et de transactions immédiates (`BEGIN IMMEDIATE`) pour garantir l'absence d'interférences entre requêtes, éliminant totalement les erreurs de type `SQLITE_BUSY`.
4.  **Cohérence Multi-produits** : La logique garantit qu'une commande avec plusieurs articles est traitée comme une seule unité (tout passe ou rien ne passe).
5.  **Requêtes Paramétrées** : Sécurisation de la base de données contre l'injection SQL.
6.  **Modernisation du Code** : Remplacement de `var`, amélioration de la gestion d'erreurs.
