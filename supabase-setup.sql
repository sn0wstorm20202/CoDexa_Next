-- =====================================================
-- CoDexa Supabase Setup Script
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Enable Required Extensions
-- =====================================================

-- Enable UUID extension (required for primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geo features (optional, but useful)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for fuzzy text search (optional)
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- Step 2: Create Helper Functions
-- =====================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Step 3: Create Test Table (Optional - for testing)
-- =====================================================

-- Uncomment below to create a test table
/*
CREATE TABLE IF NOT EXISTS test_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE test_items ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for testing
CREATE POLICY "Allow all operations for testing"
  ON test_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_test_items_updated_at
  BEFORE UPDATE ON test_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_test_items_project_id ON test_items(project_id);
*/


-- =====================================================
-- Setup Complete!
-- =====================================================

-- You can now use CoDexa to generate apps with:
-- - Database tables (with automatic RLS)
-- - Authentication
-- - File storage
-- - Realtime features

-- Next: Go to CoDexa builder and try:
-- "Create a todo list with authentication"
