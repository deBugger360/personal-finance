const request = require('supertest');
const app = require('../index');
const { clearDatabase, seedCategories, seedTransactions, seedBudgets, seedGoals } = require('./testUtils');

describe('Forecast API', () => {
    beforeEach(() => {
        clearDatabase();
        seedCategories();
        
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const currentMonthIso = `${yyyy}-${mm}`;
        
        seedBudgets([{ category_id: 2, month_iso: currentMonthIso, amount: 500 }]);
        seedGoals([{ id: 1, name: 'Car', target_amount: 5000, deadline: `${yyyy}-12-31` }]);

        // 3 month history relative to today
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const twoMonthAgo = new Date(today);
        twoMonthAgo.setMonth(twoMonthAgo.getMonth() - 2);

        seedTransactions([
            { date: twoMonthAgo.toISOString().split('T')[0], amount: 1500, category_id: 2, type: 'expense', description: 'Groceries' },
            { date: lastMonth.toISOString().split('T')[0], amount: 1400, category_id: 2, type: 'expense', description: 'Groceries' },
            { date: new Date(yyyy, today.getMonth(), 5).toISOString().split('T')[0], amount: 480, category_id: 2, type: 'expense', description: 'Groceries' } // Current month test
        ]);
    });

    afterAll(() => {
        clearDatabase();
    });

    describe('GET /api/forecast', () => {
        it('should return 4 main forecast components', async () => {
            const res = await request(app).get('/api/forecast');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('endOfMonth');
            expect(res.body).toHaveProperty('budgetRisks');
            expect(res.body).toHaveProperty('goalETAs');
            expect(res.body).toHaveProperty('outlook');
        });

        it('should detect budget overrun risk (budgetRisks)', async () => {
             const res = await request(app).get('/api/forecast');
             
             expect(res.body.budgetRisks.type).toBe('budget_overrun_probability');
             const catRisk = res.body.budgetRisks.categories.find(c => c.category === 'Groceries');
             
             // Spend 480 out of 500 in 5 days -> velocity is crazy high.
             // Projected spend will exceed 500 limit.
             expect(catRisk).toBeDefined();
             expect(catRisk.budget).toBe(500);
             expect(catRisk.spent).toBe(480);
             expect(catRisk.projectedTotal).toBeGreaterThan(500);
             expect(catRisk.risk).toBe('high'); // high risk
        });

        it('should handle zero transaction history gracefully (Empty DB)', async () => {
             clearDatabase(); // Wipe data
             const res = await request(app).get('/api/forecast');
             expect(res.status).toBe(200);
             
             // Since there's no data, calculations should zero out without crashing (e.g. NaN -> 0)
             expect(res.body.endOfMonth.projectedSpend).toBe(0);
             expect(res.body.budgetRisks.categories).toEqual([]);
             expect(res.body.goalETAs.goals).toEqual([]);
             expect(res.body.outlook.projectedChange).toBe(0);
        });

        it('should forecast negative drift when expenses consistently exceed income', async () => {
             seedTransactions([
                { date: '2026-01-01', amount: 1000, category_id: 1, type: 'income', description: 'Salary' },
                { date: '2026-02-01', amount: 1000, category_id: 1, type: 'income', description: 'Salary' },
                // Huge historical expenses wiping out income
                { date: '2026-01-20', amount: 3000, category_id: 5, type: 'expense', description: 'Debt' },
                { date: '2026-02-20', amount: 3000, category_id: 5, type: 'expense', description: 'Debt' }
             ]);

             const res = await request(app).get('/api/forecast');
             expect(res.status).toBe(200);
             expect(res.body.outlook.direction).toBe('negative');
             expect(res.body.outlook.projectedChange).toBeLessThan(0);
        });
    });
});
