# ADR 01: Gestion de la Concurrence et des Transactions

## État
Accepté

## Date
2026-03-28

## Contexte
Lors des tests de charge, nous avons identifié que la mise à jour des stocks était sujette à des conditions de concurrence (race conditions). Plusieurs requêtes concurrentes pouvaient lire le même état de stock et l'écraser, permettant ainsi de commander des pizzas qui n'étaient plus en stock.

L'utilisation de SQLite avec le driver Node.js (`sqlite3`) pose problème lors de l'utilisation de transactions explicites (`BEGIN TRANSACTION`) sous haute charge, car le driver ne gère pas nativement l'isolation des transactions par requête sur une connexion partagée, provoquant des erreurs "cannot start a transaction within a transaction".

## Décision
Nous avons décidé d'implémenter une **file d'attente (Promise Queue)** dans le service `orderManager.js` pour sérialiser l'accès aux opérations de base de données critiques. Chaque création de commande est enfermée dans une transaction SQLite (`BEGIN` / `COMMIT`).

De plus, nous utilisons une clause `WHERE stock >= qty` dans la requête `UPDATE` pour garantir qu'aucune mise à jour de stock ne puisse aboutir si les ressources sont insuffisantes, renvoyant ainsi une erreur 400 propre à l'utilisateur.

## Conséquences
- **Avantages** : Suppression des conditions de concurrence, intégrité des données garantie, suppression des erreurs de transactions imbriquées.
- **Inconvénients** : La sérialisation limite théoriquement le débit maximal à un seul thread de DB, mais étant donné la vitesse de SQLite sur disque, cela reste largement suffisant pour les besoins de l'API (passant de 300ms à 5ms par requête).
