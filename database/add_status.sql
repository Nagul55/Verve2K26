ALTER TABLE public.sub_events ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending';
UPDATE public.sub_events SET status = 'Approved' WHERE status = 'Pending' AND title != 'xyz event';
NOTIFY pgrst, 'reload schema';
