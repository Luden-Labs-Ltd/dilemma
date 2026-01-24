-- Migration: Rename dilemma names from old to new format
-- Date: 2026-01-24
-- Purpose: Sync backend dilemma names with frontend (medical, professional, state)

-- Step 1: Update dilemma names in dilemmas table
UPDATE dilemmas SET name = 'medical' WHERE name = 'trolley-problem';
UPDATE dilemmas SET name = 'professional' WHERE name = 'privacy-vs-security';
UPDATE dilemmas SET name = 'state' WHERE name = 'ai-autonomy';

-- Step 2: Update decisions table to reference new names (if dilemma_name stored as string)
-- Note: If decisions reference dilemmas by ID (foreign key), no changes needed
-- Uncomment if decisions.dilemma_name is a string column:
-- UPDATE decisions SET dilemma_name = 'medical' WHERE dilemma_name = 'trolley-problem';
-- UPDATE decisions SET dilemma_name = 'professional' WHERE dilemma_name = 'privacy-vs-security';
-- UPDATE decisions SET dilemma_name = 'state' WHERE dilemma_name = 'ai-autonomy';

-- Step 3: Verify migration
SELECT name, title FROM dilemmas;
