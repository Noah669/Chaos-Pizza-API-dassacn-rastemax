# Documentation des Tests et Couverture de Code

**Projet :** Chaos Pizza API  
**Framework de test :** [Jest](https://jestjs.io/) v29 + [Supertest](https://github.com/ladjs/supertest) v6  
**Commande :** `npm test` / `npm run test:coverage`

---

## 1. Vue d'Ensemble

Le projet dispose de **3 suites de tests** couvrant à la fois les fonctions utilitaires (tests unitaires) et les endpoints HTTP (tests d'intégration). Tous les tests passent en **< 2 secondes**.

| Suite de tests         | Fichier                  | Type         | Nbre de tests |
|------------------------|--------------------------|--------------|:-------------:|
| Pizza Model            | `tests/pizza.test.js`    | Unitaire     | 3             |
| Utils                  | `tests/utils.test.js`    | Unitaire     | 7             |
| Orders API and Service | `tests/orders.test.js`   | Intégration  | 13            |
| **Total**              |                          |              | **23**        |

---

## 2. Résultats de Couverture

Résultats obtenus avec `npm run test:coverage` (Jest + Istanbul) :

| Fichier / Module            | Statements | Branches | Functions | Lines |
|-----------------------------|:----------:|:--------:|:---------:|:-----:|
| **Ensemble du projet**      | **86.06%** | **72.72%** | **94.44%** | **91.83%** |
| `src/config/`               | 100%       | 100%     | 100%      | 100%  |
| `src/controllers/`          | 100%       | 66.66%   | 100%      | 100%  |
| `src/middlewares/`          | 91.3%      | 66.66%   | 100%      | 100%  |
| `src/models/`               | 66.66%     | 50%      | 66.66%    | 66.66%|
| `src/services/orderManager` | 81.31%     | 71.21%   | 94.11%    | 89.74%|
| `src/utils/`                | 100%       | 100%     | 100%      | 100%  |

> **Seuil atteint :** Le taux global de couverture est **supérieur à 80%** sur l'ensemble des métriques clés (Statements et Lines), validant ainsi le Quality Gate du projet.

---

## 3. Détail des Suites de Tests

### 3.1 `pizza.test.js` — Modèle Pizza

Tests unitaires du modèle de données `src/models/pizza.js`.

| Test | Description | Résultat |
|------|-------------|:--------:|
| `getAllPizzas` | Retourne un tableau non-vide avec les propriétés `id`, `name`, `price`, `stock` | ✅ |
| `getPizzaPrice` — ID valide | Retourne un prix > 0 pour la Margherita (ID 1) | ✅ |
| `getPizzaPrice` — ID invalide | Retourne 0 pour un ID inexistant (9999) | ✅ |

**Stratégie :** Tests sur base de données SQLite réelle (en mémoire via l'environnement de test). La connexion est fermée proprement dans `afterAll`.

---

### 3.2 `utils.test.js` — Fonctions Utilitaires

Tests unitaires des fonctions `src/utils/utils.js`. Le module `pizza` est **mocké** (`jest.mock`) pour isoler les tests.

| Fonction                | Test | Description | Résultat |
|-------------------------|------|-------------|:--------:|
| `round`                 | Arrondi à 2 décimales | `10.555` → `10.56` | ✅ |
| `round`                 | Valeurs falsy | `null`, `undefined`, `0` → `0` | ✅ |
| `formatPrice`           | Format string | `10` → `'10€'` | ✅ |
| `calculateOrderTotalLegacy` | Commande nulle | Retourne `0` si `order` ou `items` absent | ✅ |
| `calculateOrderTotalLegacy` | Item sans pizzaId | Ignore l'item, total = `0` | ✅ |
| `calculateOrderTotalLegacy` | Calcul multi-lignes | 2 pizzas × 10€ = `30` | ✅ |
| `calculateOrderTotalLegacy` | Quantité par défaut | Pas de `qty` → utilise `1` | ✅ |

---

### 3.3 `orders.test.js` — API de Commandes (Intégration)

Tests d'intégration HTTP via **Supertest** sur l'application Express complète.

**Setup :**
- `beforeAll` : attente de l'initialisation SQLite, préchauffage du cache pizza via `GET /pizzas`.
- `afterAll` : fermeture propre de la connexion à la base de données.

#### Routes testées :

**`GET /pizzas`**

| Test | Attendu | Résultat |
|------|---------|:--------:|
| Liste des pizzas disponibles | Status 200, tableau non-vide | ✅ |

**`GET /orders`**

| Test | Attendu | Résultat |
|------|---------|:--------:|
| Liste de toutes les commandes | Status 200, tableau | ✅ |

**`POST /orders` — Validations**

| Test | Scénario | Attendu | Résultat |
|------|----------|---------|:--------:|
| Champs `items` manquants | `{}` | 400 + `"items are required"` | ✅ |
| Champ `email` manquant | `{ items: [...] }` | 400 + `"email is required"` | ✅ |
| Stock insuffisant | qty: 1000 | 400 + `"Rupture de stock"` | ✅ |

**`POST /orders` — Logique de Prix et Promotions**

| Test | Scénario | Calcul | Attendu | Résultat |
|------|----------|--------|---------|:--------:|
| Commande simple | 1× Margherita (10€) | 10 × 1 | `10€` | ✅ |
| Code `FREEPIZZA` | 1× Margherita, promo | 10 × 0 | `0€` | ✅ |
| Code `HALF` | 1× Margherita, promo | 10 / 2 | `5€` | ✅ |
| Code `STUDENT` | 1× Margherita, promo | 10 × 0.9 | `9€` | ✅ |
| Remise 2+ articles | P1(10€) + P2(12.5€) | 22.5 × 0.9 | `20.25€` | ✅ |
| Remise > 3 articles | 4 pizzas = 43.5€ | (43.5 × 0.9) − 5 | `34.15€` | ✅ |

**`GET /orders/user/:email`**

| Test | Attendu | Résultat |
|------|---------|:--------:|
| Historique par email | Status 200, tableau, au moins une entrée avec l'email correspondant | ✅ |

**Middleware 404**

| Test | Attendu | Résultat |
|------|---------|:--------:|
| Route inconnue | Status 404 | ✅ |

---

## 4. Stratégie de Test et Seuil de Couverture

### Objectif : ≥ 80% de couverture

Le seuil de **80% de couverture** est imposé par le Quality Gate **SonarQube** (configuré dans `sonar-project.properties`). Ce seuil est atteint et dépassé :

- **Statements :** 86.06% ✅
- **Lines :** 91.83% ✅
- **Functions :** 94.44% ✅
- **Branches :** 72.72% ⚠️ *(en-dessous du seuil, mais branches difficiles à atteindre, voir ci-dessous)*

### Zones non couvertes et justification

| Fichier | Lignes non couvertes | Justification |
|---------|---------------------|---------------|
| `src/models/` (lignes 10-13) | Callback d'erreur SQLite | Nécessiterait de mocker le driver SQLite en erreur, complexité disproportionnée |
| `src/middlewares/` (lignes 8, 28) | Branches d'erreur interne | Cas d'erreur serveur critique non simulable sans infrastructure dédiée |
| `src/services/orderManager` (lignes ~75, 127-128, 148) | Rollback en cas d'erreur DB critique | Race condition volontairement sérialisée : ces branches nécessitent une corruption simulée de la BD |

### Choix techniques

| Décision | Justification |
|----------|---------------|
| **Supertest** pour les tests d'intégration | Permet de tester l'API HTTP complète sans démarrer un serveur réseau réel |
| **`jest.mock`** dans `utils.test.js` | Isole les tests unitaires du modèle de données pour garantir leur déterminisme |
| **Base de données réelle** dans `pizza.test.js` et `orders.test.js` | Valide le comportement réel de SQLite, incluant les transactions et le verrouillage |
| **`beforeAll` avec délai** | Attend la finalisation des opérations asynchrones d'initialisation de la BD |

---

## 5. Intégration CI/CD

Les tests sont exécutés automatiquement à chaque push via **GitLab CI** (`.gitlab-ci.yml`). Le rapport de couverture LCOV est transmis à **SonarQube Cloud** pour analyse de la qualité globale du code.

```yaml
# Extrait du pipeline CI
test:
  script:
    - npm run test:coverage
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
```

Le rapport de couverture est généré dans `coverage/lcov.info` (exclu du suivi Git).
