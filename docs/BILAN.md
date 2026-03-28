# Document de Bilan - Projet Chaos Pizza

Ce document synthétise le travail de maintenance applicative, d'optimisation et de sécurisation réalisé sur l'API Chaos Pizza.

## 1. Évolution de la Qualité

### État Initial (Séance 1)
- **Dette Technique** : Importante. Le code utilisait des pratiques obsolètes (`var`), manquait de structure (tout dans un seul fichier initialement) et contenait des délais artificiels.
- **Fiabilité** : Très faible. Des conditions de concurrence permettaient de commander des pizzas sans stock.
- **Sécurité** : Critique. Présence de vulnérabilités d'injection SQL par concaténation de chaînes.

### État Final (Séance 3)
- **Refactorisation** : Le code est désormais structuré par couches (`src/controllers`, `src/services`, `src/models`).
- **Analyse Statique** : Les "Code Smells" ont été drastiquement réduits. L'utilisation de `const` et `let` remplace partout `var`.
- **Réduction de la Dette** : L'optimisation des performances a supprimé les goulots d'étranglement (latence moyenne passée de 300ms à <5ms).

## 2. Correctifs Majeurs

### Sécurisation SQL
Nous avons remplacé toutes les concaténations de chaînes dans les requêtes par des **requêtes paramétrées** (ex: `UPDATE ... WHERE id = ?`). Cela protège l'API contre les injections SQL, une faille critique présente à l'origine.

### Gestion de la Concurrence
Le correctif le plus complexe a été la gestion des transactions SQLite. Nous avons :
1. Centralisé la création de commande via une **Promise Queue** pour éviter les conflits de transactions.
2. Utilisé **`BEGIN IMMEDIATE`** pour verrouiller la base dès l'entrée en transaction.
3. Ajouté une vérification de stock directement dans la requête `UPDATE` (`WHERE stock >= qty`).

## 3. Retour d'Expérience

### Difficultés Rencontrées
- **Limitation de SQLite** : La gestion native des transactions avec le driver `sqlite3` de Node.js est limitée sur une seule connexion partagée. L'implémentation d'une file d'attente a été nécessaire pour pallier ce problème sous haute charge.
- **Refactoring** : Extraire la logique d'un code "legacy" tout en assurant la non-régression a demandé une analyse rigoureuse des règles de promotion complexes (plusieurs pizzas, remise étudiante, fix urgent, etc.).

### Conclusion
L'API est désormais rapide, sécurisée et prête pour une mise en production réelle. Chaos Pizza peut maintenant affronter le rush du vendredi soir sans crainte !
