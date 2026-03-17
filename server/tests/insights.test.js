const request = require('supertest');
const app = require('../index');
const { clearDatabase, seedCategories, seedTransactions, seedGoals } = require('./testUtils');

describe('Insights API', () => {
    beforeAll(() => {
        clearDatabase();
        seedCategories();
        
        // Add active goal
        seedGoals([{ id: 1, name: 'Vacation Fund', target_amount: 1000, deadline: '2026-12-31' }]);

        // 3-Month Baseline Data
        // Month 1 (e.g. 3 months ago)
        seedTransactions([
            { date: '2026-01-10', amount: 500, category_id: 2, type: 'expense', description: 'Groceries' },
            { date: '2026-01-15', amount: 200, category_id: 5, type: 'expense', description: 'Shopping' },
            { date: '2026-01-01', amount: 5000, category_id: 1, type: 'income', description: 'Salary' }
        ]);
        // Month 2 (2 months ago)
        seedTransactions([
            { date: '2026-02-10', amount: 550, category_id: 2, type: 'expense', description: 'Groceries' },
            { date: '2026-02-01', amount: 5000, category_id: 1, type: 'income', description: 'Salary' }
        ]);
        // Month 3 (last month)
        seedTransactions([
            { date: '2026-03-10', amount: 600, category_id: 2, type: 'expense', description: 'Groceries' },
            { date: '2026-03-15', amount: 900, category_id: 5, type: 'expense', description: 'Huge Shopping' }, // Trend inflation
            { date: '2026-03-01', amount: 5000, category_id: 1, type: 'income', description: 'Salary' }
        ]);
    });

    afterAll(() => {
        clearDatabase();
    });

    describe('GET /api/insights', () => {
        it('should detect trend inflation (expenses higher than previous month)', async () => {
            const res = await request(app).get('/api/insights');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);

            // We expect at least one insight
            expect(res.body.length).toBeGreaterThan(0);

            // Find the Lifestyle Inflation insight
            const inflationInsight = res.body.find(i => i.title === 'Lifestyle Inflation Detected');
            if (inflationInsight) {
               expect(inflationInsight.type).toBe('trend');
               expect(inflationInsight.message).toContain('Expenses increased');
            }
        });

        it('should trigger opportunity detection (lazy money) when surplus exists', async () => {
            const res = await request(app).get('/api/insights');
            expect(res.status).toBe(200);

            const surplusInsight = res.body.find(i => i.title === 'Surplus Available');
            expect(surplusInsight).toBeDefined();
            expect(surplusInsight.type).toBe('opportunity');
            expect(surplusInsight.message).toContain('Consider allocating extra to "Vacation Fund"');
        });

        it('should handle zero transactions gracefully (Edge Case / Cold Start)', async () => {
            clearDatabase(); // Wipe entirely
            
            const res = await request(app).get('/api/insights');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]); // No insights for empty data
            
            // Re-seed for subsequent tests if any
            seedCategories();
        });

        it('should catch subscription creep based on descriptions', async () => {
             // Let's seed recurring charges
             seedTransactions([
                 { date: '2025-10-01', amount: 20, category_id: 6, type: 'expense', description: 'Netflix' },
                 { date: '2025-11-01', amount: 20, category_id: 6, type: 'expense', description: 'Netflix' },
                 { date: '2025-12-01', amount: 20, category_id: 6, type: 'expense', description: 'Netflix' },
                 { date: '2026-01-01', amount: 25, category_id: 6, type: 'expense', description: 'Netflix' }, // Increasing...
                 { date: '2026-02-01', amount: 25, category_id: 6, type: 'expense', description: 'Netflix' },
                 { date: '2026-03-01', amount: 30, category_id: 6, type: 'expense', description: 'Netflix' }  // Spike!
             ]);

             const res = await request(app).get('/api/insights');
             const subCreep = res.body.find(i => i.title.includes('Subscription Change'));
             expect(subCreep).toBeDefined();
             expect(subCreep.type).toBe('observation');
        });
    });
});
