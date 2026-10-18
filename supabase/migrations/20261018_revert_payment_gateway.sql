-- ==============================================================================
-- Rollback / Revert Payment Gateway & Registration Fees Migration
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Drop Webhook Deliveries Table & Policies
DROP TABLE IF EXISTS public.webhook_deliveries CASCADE;

-- 2. Drop Payments Table & Policies
DROP TABLE IF EXISTS public.payments CASCADE;

-- 3. Remove payment tracking columns from registrations table
ALTER TABLE public.registrations DROP COLUMN IF EXISTS payment_status;
ALTER TABLE public.registrations DROP COLUMN IF EXISTS amount_paid;
ALTER TABLE public.registrations DROP COLUMN IF EXISTS payment_id;

-- 4. Remove registration_fee column from sub_events table
ALTER TABLE public.sub_events DROP COLUMN IF EXISTS registration_fee;

-- 5. Drop any lingering payment indexes if not dropped automatically
DROP INDEX IF EXISTS idx_payments_order_id;
DROP INDEX IF EXISTS idx_payments_participant;
DROP INDEX IF EXISTS idx_payments_fest;
DROP INDEX IF EXISTS idx_payments_delivery_id;
DROP INDEX IF EXISTS idx_registrations_payment_status;
DROP INDEX IF EXISTS idx_webhook_deliveries_id;
DROP INDEX IF EXISTS idx_webhook_deliveries_order_id;
