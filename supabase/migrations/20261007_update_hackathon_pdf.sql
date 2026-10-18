-- Drop the old problem statements table since we haven't stored any data yet
DROP TABLE IF EXISTS hackathon_problem_statements;

-- Create the new problem statements table for PDFs
CREATE TABLE hackathon_problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hackathon_problem_statements ENABLE ROW LEVEL SECURITY;

-- Allow public read access to problem statements
CREATE POLICY "Public can read hackathon problem statements"
ON hackathon_problem_statements FOR SELECT
USING (true);

-- Allow admin full access (assuming admin checks are handled by service role or specific policies)
CREATE POLICY "Admins can manage problem statements"
ON hackathon_problem_statements FOR ALL
USING (auth.role() = 'authenticated'); -- Adjust based on actual admin role setup

-- Create the storage bucket for PDFs if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hackathon-problem-statements', 'hackathon-problem-statements', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the bucket
-- Allow public to read PDFs
CREATE POLICY "Public can view hackathon problem statements"
ON storage.objects FOR SELECT
USING (bucket_id = 'hackathon-problem-statements');

-- Allow authenticated users (admins) to upload/update/delete
CREATE POLICY "Admins can insert hackathon problem statements"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hackathon-problem-statements' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update hackathon problem statements"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hackathon-problem-statements' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete hackathon problem statements"
ON storage.objects FOR DELETE
USING (bucket_id = 'hackathon-problem-statements' AND auth.role() = 'authenticated');
