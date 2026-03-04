const request = require("supertest");
const app = require("../app");

describe("POST /orders", () => {
  it("should get all orders", async () => {
    const response = await request(app)
      .get("/orders");

    expect(response.statusCode).toBe(200);
  });
});