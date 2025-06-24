-- Budget Module Migration Script
-- This script enhances the existing budget tables to support comprehensive budget management

-- First, rename the existing budget_categories table to expense_categories to avoid confusion
ALTER TABLE budget_categories RENAME TO expense_categories_old;

-- Drop the existing budgets table (we'll recreate it with better structure)
-- Note: In production, you'd want to migrate existing data
DROP TABLE IF EXISTS budgets;

-- Create the new budgets table with enhanced features
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('monthly', 'goal')),
    amount DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    rollover_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create budget_categories table for category-specific budget allocations
CREATE TABLE budget_categories (
    id INTEGER PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    allocated_amount DECIMAL(10, 2) NOT NULL,
    alert_threshold_50 BOOLEAN DEFAULT TRUE,
    alert_threshold_75 BOOLEAN DEFAULT TRUE,
    alert_threshold_90 BOOLEAN DEFAULT TRUE,
    alert_threshold_100 BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(budget_id, category_id)
);

-- Create budget_goals table for goal-based budgets
CREATE TABLE budget_goals (
    id INTEGER PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0,
    target_date DATE NOT NULL,
    auto_contribute_amount DECIMAL(10, 2),
    auto_contribute_frequency VARCHAR(20) CHECK (auto_contribute_frequency IN ('weekly', 'monthly', 'biweekly')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_type ON budgets(type);
CREATE INDEX idx_budget_categories_budget_id ON budget_categories(budget_id);
CREATE INDEX idx_budget_goals_budget_id ON budget_goals(budget_id);
CREATE INDEX idx_budget_goals_target_date ON budget_goals(target_date);

-- Insert some sample budget data for testing (optional)
-- This can be removed in production
/*
INSERT INTO budgets (user_id, name, type, amount, start_date, status) 
VALUES 
    (1, 'June 2024 Budget', 'monthly', 5000.00, '2024-06-01', 'active'),
    (1, 'Europe Trip Savings', 'goal', 5000.00, '2024-01-01', 'active');

-- Add category allocations for monthly budget
INSERT INTO budget_categories (budget_id, category_id, allocated_amount)
SELECT 1, id, 
    CASE 
        WHEN name = 'Housing' THEN 1500.00
        WHEN name = 'Groceries' THEN 600.00
        WHEN name = 'Transportation' THEN 400.00
        WHEN name = 'Entertainment' THEN 300.00
        ELSE 200.00
    END
FROM categories
WHERE type = 'expense';

-- Add goal details
INSERT INTO budget_goals (budget_id, goal_name, target_amount, target_date, auto_contribute_amount, auto_contribute_frequency)
VALUES (2, 'Europe Trip', 5000.00, '2024-12-31', 500.00, 'monthly');
*/