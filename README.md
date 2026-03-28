# Chaos Pizza API (v1.1.0)

Une API de commande de pizza, désormais stable sous charge.

## Installation
```bash
npm install
```

## Lancement de l'API
```bash
npm start
```

## Effectuer un test de montée en charge (Load Test)
L'API doit être lancée dans un terminal séparé au préalable.
```bash
npm run load-test
```
Ce script utilise **Artillery** (configuré dans `loadtest.yml`) pour simuler une "ruée sur les 50 Margheritas" à une cadence de 20 requêtes par seconde.

## Documentation
- [Rapport de Performance](./docs/performance.md) (Avant / Après)
- [ADR Index](./docs/adr/) : Historique des décisions architecturales.
- [Journal des Modifications](./CHANGELOG.md) (Changelog)
