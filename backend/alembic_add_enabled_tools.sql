-- Add enabled_tools column to integrations table
-- Run this SQL if you want to add the column without Alembic

ALTER TABLE integrations ADD COLUMN enabled_tools JSON DEFAULT '[]';
