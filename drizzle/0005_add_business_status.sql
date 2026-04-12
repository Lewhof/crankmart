-- Migration: Add status column to businesses table
-- Date: 2026-03-30
-- Purpose: Support disabled/active/paused/removed status for directory listings

-- Create enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "business_status" AS ENUM('disabled', 'active', 'paused', 'removed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status column (default 'disabled' for all existing businesses)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS status business_status DEFAULT 'disabled' NOT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);

-- Update comment
COMMENT ON COLUMN businesses.status IS 'Business listing status: disabled (not visible), active (visible), paused (owner pause), removed (soft delete)';
