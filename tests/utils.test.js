const { round, formatPrice, calculateOrderTotalLegacy } = require('../src/utils/utils');
const pizzaModel = require('../src/models/pizza');

// Mock pizzaModel for calculateOrderTotalLegacy tests
jest.mock('../src/models/pizza');

describe('Utils', () => {
    describe('round', () => {
        it('should round a number to 2 decimal places', () => {
            expect(round(10.555)).toBe(10.56);
            expect(round(10.554)).toBe(10.55);
        });

        it('should return 0 for falsy values', () => {
            expect(round(null)).toBe(0);
            expect(round(undefined)).toBe(0);
            expect(round(0)).toBe(0);
        });
    });

    describe('formatPrice', () => {
        it('should format a number as a price string', () => {
            expect(formatPrice(10)).toBe('10€');
            expect(formatPrice(12.5)).toBe('12.5€');
        });
    });

    describe('calculateOrderTotalLegacy', () => {
        it('should return 0 if order or items are missing', () => {
            expect(calculateOrderTotalLegacy(null)).toBe(0);
            expect(calculateOrderTotalLegacy({})).toBe(0);
        });

        it('should skip items without pizzaId', () => {
            const order = {
                items: [{ qty: 1 }]
            };
            expect(calculateOrderTotalLegacy(order)).toBe(0);
        });

        it('should calculate total based on pizza prices', () => {
            pizzaModel.getPizzaPrice.mockReturnValue(10);
            const order = {
                items: [
                    { pizzaId: 1, qty: 2 },
                    { pizzaId: 2, qty: 1 }
                ]
            };
            // 10 * 2 + 10 * 1 = 30
            expect(calculateOrderTotalLegacy(order)).toBe(30);
        });

        it('should use default qty of 1', () => {
            pizzaModel.getPizzaPrice.mockReturnValue(5);
            const order = {
                items: [{ pizzaId: 1 }]
            };
            expect(calculateOrderTotalLegacy(order)).toBe(5);
        });
    });
});
