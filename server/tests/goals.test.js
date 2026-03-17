const request = require('supertest');
const app = require('../index');
const { clearDatabase, seedGoals } = require('./testUtils');

describe('Goals API', () => {
    beforeEach(() => {
        clearDatabase();
    });

    afterAll(() => {
        clearDatabase();
    });

    describe('GET /api/goals', () => {
        it('should return empty when no goals exist', async () => {
            const res = await request(app).get('/api/goals');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return list of seeded goals with computed current_balance', async () => {
             seedGoals([
                 { id: 1, name: 'Trip', target_amount: 1000 },
                 { id: 2, name: 'Car', target_amount: 5000 }
             ]);
             // Seed some funding via transactions to test the SQL JOIN calculation
             const { seedTransactions, seedCategories } = require('./testUtils');
             seedCategories();
             seedTransactions([
                 { date: '2026-03-01', amount: 100, category_id: 4, type: 'transfer', description: 'Fund Trip', goal_id: 1 }
             ]);

             const res = await request(app).get('/api/goals');
             expect(res.status).toBe(200);
             expect(res.body).toHaveLength(2);
             
             const tripGoal = res.body.find(g => g.name === 'Trip');
             expect(tripGoal.current_balance).toBe(100); 
        });
    });

    describe('POST /api/goals', () => {
        it('should create a valid goal', async () => {
             const res = await request(app).post('/api/goals').send({
                 name: 'Emergency Fund',
                 target_amount: 10000,
                 deadline: '2026-12-31'
             });
             expect(res.status).toBe(200);
             expect(res.body).toHaveProperty('id');
        });
    });

    describe('POST /api/goals/:id/fund', () => {
        it('should correctly fund an existing goal via transactions', async () => {
             seedGoals([{ id: 1, name: 'Fund Tracker', target_amount: 100 }]);
             const { seedCategories } = require('./testUtils');
             seedCategories(); // Must seed categories since fund route searches for 'savings' category
             
             const res = await request(app).post('/api/goals/1/fund').send({ amount: 50 });
             expect(res.status).toBe(200);
             expect(res.body.success).toBe(true);

             // Verify it also creates a background transfer transaction? 
             const verifyRes = await request(app).get('/api/goals');
             const goal = verifyRes.body.find(g => g.id === 1);
             expect(goal.current_balance).toBe(50);
        });

        it('should handle zero or negative funding gracefully (if API relies on SQlite loose typing)', async () => {
             seedGoals([{ id: 2, name: 'Empty', target_amount: 100 }]);
             const { seedCategories } = require('./testUtils');
             seedCategories();

             // Current implementation just executes the INSERT blind. So we expect a 200, but a negative balance.
             const res = await request(app).post('/api/goals/2/fund').send({ amount: -10 });
             expect(res.status).toBe(200);
             
             const check = await request(app).get('/api/goals');
             const goal = check.body.find(g => g.id === 2);
             expect(goal.current_balance).toBe(-10); // Verifying lack of strict validation behaves exactly internally
        });
    });
});
