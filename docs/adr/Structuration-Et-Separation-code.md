# ADR 02: Structuration du Code et Séparation HTML/JS

## État
Accepté

## Date
2026-03-30

## Contexte
Le projet souffrait de deux problèmes de structuration distincts :

**Côté serveur**, l'intégralité du code JavaScript était regroupée à la racine du projet : routes, logique métier, accès à la base de données et configuration coexistaient au même niveau, sans séparation de responsabilités. Ajouter une fonctionnalité impliquait de modifier des fichiers aux responsabilités floues.

**Côté frontend**, bien que les fichiers HTML fussent déjà isolés dans `public/`, le comportement JavaScript était directement embarqué dans le HTML : balises `<script>` inline, attributs `onclick`/`onchange` sur les éléments. Cela couplait fortement la structure et le comportement, rendant le HTML illisible et le JS intestable.

## Décision

### 1. Architecture en couches pour le backend

Nous avons migré l'ensemble du code serveur dans un dossier `src/` organisé par responsabilité :

| Dossier | Rôle |
|---|---|
| `routes/` | Définition des endpoints Express, délégation aux services |
| `services/` | Logique métier (ex. `orderManager.js`), orchestration des opérations |
| `models/` | Accès aux données et requêtes SQL |
| `utils/` | Fonctions utilitaires partagées, sans dépendance aux autres couches |
| `config/` | Configuration de l'application (connexion DB, variables d'environnement) |

**Règle de dépendance :** les couches ne peuvent dépendre que des couches inférieures (`routes` → `services` → `models`). Aucune route ne contient de requête SQL directement, aucun modèle ne contient de logique métier.

Les fichiers `app.js`, `server.js` et `database.js` restent à la racine de `src/` en tant que points d'entrée uniquement.

### 2. Séparation HTML/JS dans le frontend

Tout le JavaScript a été extrait des fichiers HTML vers des fichiers `.js` dédiés dans `public/` :
- Suppression de toutes les balises `<script>` inline dans le HTML
- Suppression de tous les attributs `onclick`/`onchange` sur les éléments
- Le HTML ne contient plus que du balisage sémantique

## Conséquences
- **Avantages** : Le HTML est prévisualisable et lisible sans JS ; chaque couche backend est testable indépendamment ; la logique métier centralisée dans `services/` a directement facilité l'implémentation de la Promise Queue décrite dans l'ADR 01 ; les responsabilités de chaque fichier sont immédiatement identifiables.
- **Inconvénients** : Nécessite de respecter la règle de dépendance entre couches côté serveur, et de ne pas réintroduire de JS inline côté frontend au fil des évolutions.