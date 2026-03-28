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

  // Queue the database work to prevent transaction overlap (avoiding "SQLITE_ERROR: cannot start a transaction within a transaction")
  orderQueue = orderQueue.then(() => new Promise((resolve) => {
    db.serialize(() => {
      // BEGIN IMMEDIATE locks the database for writing immediately, preventing other concurrent writers 
      // from starting a transaction and later failing with SQLITE_BUSY.
      db.run("BEGIN IMMEDIATE TRANSACTION", (errBegin) => {
        if (errBegin) {
          console.error("Critical: Could not start transaction:", errBegin);
          cb({ error: "Service temporarily unavailable (concurrency lock)" });
          return resolve();
        }

        let itemsProcessed = 0;
        let hasError = false;

        // Cleanup helper to handle rollbacks and errors consistently
        const cleanupAndRollback = (errorMsg, logMsg = null) => {
          if (hasError) return;
          hasError = true;
          if (logMsg) console.warn(`Order failed: ${logMsg}`);

          db.run("ROLLBACK", (errRollback) => {
            if (errRollback) console.error("Critical: Rollback failed!", errRollback);
            cb({ error: errorMsg });
            resolve();
          });
        };

        // Process each item in the order to deduct stock safely
        for (const item of order.items) {
          const pizzaId = item.pizzaId;
          const qty = item.qty || 1;

          db.run(
            "UPDATE pizzas SET stock = stock - ? WHERE id = ? AND stock >= ?",
            [qty, pizzaId, qty],
            function (errUpdate) {
              if (hasError) return;

              if (errUpdate) return cleanupAndRollback("Internal database error during stock update", errUpdate.message);

              // If no rows were changed, it means stock was insufficient for this pizza
              if (this.changes === 0) {
                return cleanupAndRollback(`Rupture de stock pour la pizza (ID: ${pizzaId})`, `Insufficient stock for ID ${pizzaId}`);
              }

              itemsProcessed++;
              if (itemsProcessed === order.items.length) {
                // All items validated and stock reserved, proceed to record order
                db.run(
                  "INSERT INTO orders (total, status, promo) VALUES (?, 'CREATED', ?)",
                  [total, promoUsed],
                  function (errInsert) {
                    if (hasError) return;
                    if (errInsert) return cleanupAndRollback("Failed to record order in database", errInsert.message);

                    const newOrderId = this.lastID;
                    db.run("COMMIT", (errCommit) => {
                      if (hasError) return;

                      if (errCommit) {
                        console.error("Critical: Commit failed!", errCommit);
                        return cleanupAndRollback("Final transaction confirmation failed");
                      }

                      // Success path
                      cb(null, {
                        id: newOrderId,
                        total: utils.round(total),
                        status: "CREATED"
                      });
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
    console.error("Order processing queue exception:", err);
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