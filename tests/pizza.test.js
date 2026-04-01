const db = require('../src/database');
const { getAllPizzas, getPizzaPrice } = require('../src/models/pizza');

describe('Pizza Model', () => {
    afterAll((done) => {
        db.close(done);
    });

    describe('getAllPizzas', () => {
        it('should return all pizzas in the database', (done) => {
            getAllPizzas((err, rows) => {
                expect(err).toBeNull();
                expect(Array.isArray(rows)).toBe(true);
                expect(rows.length).toBeGreaterThan(0);
                expect(rows[0]).toHaveProperty('id');
                expect(rows[0]).toHaveProperty('name');
                expect(rows[0]).toHaveProperty('price');
                expect(rows[0]).toHaveProperty('stock');
                done();
            });
        });
    });

    describe('getPizzaPrice', () => {
        it('should return the price for a valid pizza ID from cache', () => {
            // note: model cache initialization might take a moment 
            // but it should be loaded after DB initialization
            const price = getPizzaPrice(1); // Margherita
            expect(price).toBeGreaterThan(0);
        });

        it('should return 0 for an invalid pizza ID', () => {
            const price = getPizzaPrice(9999);
            expect(price).toBe(0);
        });
    });
});
