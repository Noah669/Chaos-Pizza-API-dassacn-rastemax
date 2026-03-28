const db = require('../database');
const pizzaModel = require('../models/pizza');
const utils = require('../utils/utils');

// Simple queue to serialize order creations and avoid nested transaction errors in SQLite
let orderQueue = Promise.resolve();

/**
 * Creates a new pizza order.
 * Optimized version: removed arbitrary delays, added parameterized queries, and atomicity.
 * Uses a queue to handle concurrent transactions safely.
 * @param {Object} order The order object containing items and promoCode.
 * @param {Function} cb Callback function (error, result).
 */
function createOrder(order, cb) {
  // basic validation
  if (!order?.items || !Array.isArray(order.items) || order.items.length === 0) {
    return cb({ error: "invalid order: items are required" });
  }

  // Calculate prices beforehand outside the database lock
  let subtotal = 0;
  for (const item of order.items) {
    const price = pizzaModel.getPizzaPrice(item.pizzaId);
    subtotal += price * (item.qty || 1);
  }

  let total = subtotal;

  // Apply promo codes
  if (order.promoCode) {
    if (order.promoCode === "FREEPIZZA") {
      total = 0;
    } else if (order.promoCode === "HALF") {
      total = total / 2;
    } else if (order.promoCode === "STUDENT") {
      total = total * 0.9;
    }
  }

  // New promo rule: 10% discount for orders with 2 or more items
  if (order.items.length >= 2) {
    total = total * 0.9;
  }

  // Urgent promo fix: additional 5 discount for more than 3 items
  if (order.items.length > 3) {
    total = total - 5;
  }

  if (total <= 0 && order.promoCode !== "FREEPIZZA") {
    total = utils.calculateOrderTotalLegacy(order);
  }

  if (total === 0 && order.promoCode !== "FREEPIZZA") {
    total = 10;
  }

  const promoUsed = order.promoCode || "";

  // Queue the database work to prevent transaction overlap
  orderQueue = orderQueue.then(() => new Promise((resolve) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION", (errBegin) => {
        if (errBegin) {
          cb({ error: "Failed to start transaction" });
          return resolve();
        }

        let itemsProcessed = 0;
        let hasError = false;

        const cleanup = (errorMsg) => {
          if (hasError) return;
          hasError = true;
          db.run("ROLLBACK", () => {
            cb({ error: errorMsg });
            resolve();
          });
        };

        for (const item of order.items) {
          const pizzaId = item.pizzaId;
          const qty = item.qty || 1;

          db.run(
            "UPDATE pizzas SET stock = stock - ? WHERE id = ? AND stock >= ?",
            [qty, pizzaId, qty],
            function (errUpdate) {
              if (hasError) return;

              if (errUpdate) return cleanup("Internal database error");
              if (this.changes === 0) return cleanup(`Not enough stock for pizza ID ${pizzaId}`);

              itemsProcessed++;
              if (itemsProcessed === order.items.length) {
                // Done with all items, insert the order
                db.run(
                  "INSERT INTO orders (total, status, promo) VALUES (?, 'CREATED', ?)",
                  [total, promoUsed],
                  function (errInsert) {
                    if (hasError) return;
                    if (errInsert) return cleanup("Failed to record order");

                    const newOrderId = this.lastID;
                    db.run("COMMIT", (errCommit) => {
                      if (errCommit) {
                        cb({ error: "Transaction failed to commit" });
                      } else {
                        cb(null, {
                          id: newOrderId,
                          total: utils.round(total),
                          status: "CREATED"
                        });
                      }
                      resolve();
                    });
                  }
                );
              }
            }
          );
        }
      });
    });
  })).catch(err => {
    console.error("Order queue error:", err);
  });
}

function getOrders(cb) {
  db.all("SELECT * FROM orders", (err, rows) => {
    if (err) return cb(err);

    // Taxes apply only to listing for display? 
    // Keeping existing behavior but improving consistency
    const result = rows.map(row => ({
      ...row,
      total: utils.round(row.total * 1.05) // Taxe d'inflation sauvage appliquée a posteriori
    }));

    cb(null, result);
  });
}

module.exports = {
  createOrder,
  getOrders
};