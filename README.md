# Chaos Pizza API (v1.1.0)

Bienvenue sur l'API de commande de Chaos Pizza. Ce projet a été refactorisé pour être performant, sécurisé et scalable sous haute charge.

## Installation & Lancement

### Pré-requis
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/)

### Installation
```bash
npm install
```

### Lancer le serveur
```bash
npm start
```
L'API est accessible par défaut sur `http://localhost:3000`.

---

## Tests & Qualité

### Tests de Non-Régression
Pour vérifier que les fonctionnalités de base (création de commande, liste des pizzas) fonctionnent toujours :
```bash
npm test
```

### Tests de Montée en Charge (Artillery)
L'API doit être lancée dans un terminal séparé. Pour tester la stabilité sous le "rush" (20 req/s, 50 Margheritas) :
```bash
npm run load-test
```

### Analyse Qualité (SonarQube)
L'analyse statique peut être lancée localement via `sonar-scanner` ou via la CI/CD GitLab. Les résultats se trouvent sur le tableau de bord SonarQube.
Ce script utilise **Artillery** (configuré dans `loadtest.yml`) pour simuler une "ruée sur les 50 Margheritas" à une cadence de 20 requêtes par seconde.

---

## Documentation & Livrables

Tous les documents requis pour le projet sont disponibles ici :

- **[Rapport de Performance](./docs/performance.md)** : Analyse de la réduction de la latence (300ms -> 5ms) et protection des stocks.
- **[Décisions Architecturales (ADR)](./docs/adr/gestion-concurrence.md)** : Explication technique de la gestion de la concurrence SQLite.
- **[Journal des Modifications (Changelog)](./CHANGELOG.md)** : Historique des versions et corrections majeures.
- **[Bilan du Projet](./docs/BILAN.md)** : Analyse critique, réduction de la dette technique et retour d'expérience.
- **[Intégration Continue](./.gitlab-ci.yml)** : Pipeline de build, test et analyse statique.

---
