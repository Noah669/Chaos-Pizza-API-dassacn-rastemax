const request = require("supertest");
const app = require("../src/app");
const db = require('../src/database');
const orders = require('../src/services/orderManager');

describe("Orders API and Service", () => {
  // wait for DB to initialize
  beforeAll(async () => {
    // slightly wait for the database creation serialize to finish
    await new Promise(resolve => setTimeout(resolve, 500));
    // Warm up pizza cache
    await request(app).get("/pizzas");
  });

  afterAll((done) => {
    db.close(done);
  });

  describe("GET /orders", () => {
    it("should return a list of orders", async () => {
      const response = await request(app).get("/orders");
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /pizzas", () => {
    it("should return a list of pizzas", async () => {
      const response = await request(app).get("/pizzas");
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("POST /orders", () => {
    it("should return error if items are missing", async () => {
      const response = await request(app).post("/orders").send({});
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain("items are required");
    });

    it("should return error if email is missing", async () => {
      const response = await request(app).post("/orders").send({ items: [{ pizzaId: 1 }] });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain("email is required");
    });

    it("should return error if stock is insufficient", async () => {
      const response = await request(app).post("/orders").send({
        items: [{ pizzaId: 1, qty: 1000 }],
        email: "test@example.com"
      });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain("Rupture de stock");
    });

    it("should create an order with correct total (Margherita is 10.0)", async () => {
      // first order
      const response = await request(app).post("/orders").send({
        items: [{ pizzaId: 1, qty: 1 }],
        email: "test@example.com"
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBeDefined();
      // 1 x 10 = 10 (no promo)
      expect(response.body.total).toBe(10);
    });

    it("should apply FREEPIZZA promo", async () => {
      const response = await request(app).post("/orders").send({
        items: [{ pizzaId: 1, qty: 1 }],
        email: "test@example.com",
        promoCode: "FREEPIZZA"
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.total).toBe(0);
    });

    it("should apply HALF promo", async () => {
      const response = await request(app).post("/orders").send({
        items: [{ pizzaId: 1, qty: 1 }],
        email: "test@example.com",
        promoCode: "HALF"
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.total).toBe(5); // 10 / 2 = 5
    });

    it("should apply STUDENT promo", async () => {
      const response = await request(app).post("/orders").send({
        items: [{ pizzaId: 1, qty: 1 }],
        email: "test@example.com",
        promoCode: "STUDENT"
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.total).toBe(9); // 10 * 0.9 = 9
    });

    it("should apply 10% discount for 2+ items", async () => {
      const response = await request(app).post("/orders").send({
        items: [
          { pizzaId: 1, qty: 1 },
          { pizzaId: 2, qty: 1 }
        ],
        email: "test@example.com"
      });
      // (10 + 12.5) * 0.9 = 22.5 * 0.9 = 20.25
      expect(response.statusCode).toBe(200);
      expect(response.body.total).toBe(20.25);
    });

    it("should apply 5 fixed discount for >3 items", async () => {
      const response = await request(app).post("/orders").send({
        items: [
          { pizzaId: 1, qty: 1 },
          { pizzaId: 2, qty: 1 },
          { pizzaId: 3, qty: 1 },
          { pizzaId: 1, qty: 1 }
        ],
        email: "test@example.com"
      });
      // P1: 10, P2: 12.5, P3: 11, P1: 10 => Total = 43.5
      // 2+ items => 43.5 * 0.9 = 39.15
      // >3 items => 39.15 - 5 = 34.15
      expect(response.statusCode).toBe(200);
      expect(response.body.total).toBe(34.15);
    });
  });

  describe("GET /orders/user/:email", () => {
    it("should get orders by email", async () => {
      const email = "test@example.com";
      const response = await request(app).get(`/orders/user/${email}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some(o => o.email === email)).toBe(true);
    });
  });

  describe("404 and legacy middleware", () => {
    it("should return 404 for unknown route and hit legacy middleware", async () => {
      const response = await request(app).get("/unknown-route");
      expect(response.status).toBe(404);
    });
  });
});