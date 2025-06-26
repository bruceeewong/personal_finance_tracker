-- Migration to add remarks column to budget_categories table
-- Run this SQL script to add the remarks field to existing budget_categories

-- Add remarks column to budget_categories table
-- Making it nullable (optional) as existing records won't have remarks
ALTER TABLE budget_categories ADD COLUMN remarks TEXT;

-- The column is nullable by default, so existing records will have NULL remarks
-- This is the desired behavior as the remarks field is optional

-- Optional: Add an index on remarks if needed for search performance
-- CREATE INDEX idx_budget_categories_remarks ON budget_categories(remarks);