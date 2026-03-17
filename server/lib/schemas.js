const { z } = require('zod');

const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  amount: z.number().positive("Amount must be a positive number"),
  description: z.string().min(1, "Description is required").max(100),
  category_id: z.number().int().positive(),
  type: z.enum(['income', 'expense', 'transfer'])
});

const budgetSchema = z.object({
  category_id: z.number().int().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format (YYYY-MM)"),
  amount: z.number().min(0, "Amount must be zero or greater")
});

const goalSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  target_amount: z.number().positive("Target amount must be a positive number"),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").nullable().optional(),
  priority: z.number().int().min(1).max(3).optional()
});

const fundGoalSchema = z.object({
  amount: z.number().positive("Funding amount must be positive"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional()
});

const settingsSchema = z.object({
  salary: z.number().min(0, "Salary cannot be negative")
});

module.exports = {
  transactionSchema,
  budgetSchema,
  goalSchema,
  fundGoalSchema,
  settingsSchema
};
