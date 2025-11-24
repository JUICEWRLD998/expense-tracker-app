-- Add title column to existing expenses table
-- Run this SQL command in your PostgreSQL database

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- If you have existing expenses without titles, you can set default values:
-- UPDATE expenses SET title = 'Expense' WHERE title IS NULL;

-- Or make it required:
-- ALTER TABLE expenses ALTER COLUMN title SET NOT NULL;
