const db = require('../database');

let globalPizzaCache = [];

db.all("SELECT * FROM pizzas", (err, rows) => {
  if (!err) globalPizzaCache = rows;
});

// don't change this file unless necessary
function getAllPizzas(cb) {
  db.all("SELECT * FROM pizzas", (err, rows) => {
    if (!err) globalPizzaCache = rows;
    cb(err, rows);
  });
}

// legacy price logic
function getPizzaPrice(id) {
  for (const element of globalPizzaCache) {
    if (element.id == id) {
      return element.price;
    }
  }
  return 0;
}

module.exports = {
  getAllPizzas,
  getPizzaPrice,
}