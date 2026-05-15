-- 1. Modify the students table to include new fields and unique constraints
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS degree TEXT,
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS passout_year TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Drop existing constraint if any, then add unique on email and phone
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_email_key;
ALTER TABLE students ADD CONSTRAINT students_email_phone_key UNIQUE (email, phone);

-- Ensure public insert is allowed for students
DROP POLICY IF EXISTS "Anyone can insert a student." ON students;
CREATE POLICY "Anyone can insert a student." ON students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Students can update their own row" ON students;
CREATE POLICY "Students can update their own row" ON students FOR UPDATE USING (true);
-- Note: In a production app with RLS, we'd use matching email/phone to allow update, but for this lead capture demo, 'true' is set for simplicity on UPSERTs.

-- Ensure applications public insert
DROP POLICY IF EXISTS "Anyone can insert an application." ON applications;
CREATE POLICY "Anyone can insert an application." ON applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update an application." ON applications;
CREATE POLICY "Anyone can update an application." ON applications FOR UPDATE USING (true);

-- Ensure payments public insert
DROP POLICY IF EXISTS "Anyone can insert a payment." ON payments;
CREATE POLICY "Anyone can insert a payment." ON payments FOR INSERT WITH CHECK (true);

-- 2. Create Storage Bucket for Resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Resumes
-- Allow anyone to upload a resume
CREATE POLICY "Resume Upload Policy" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'resumes');

-- Allow anyone to view resumes (or restrict to admin)
CREATE POLICY "Resume View Policy" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'resumes');
