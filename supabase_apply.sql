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

-- 3. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'video')),
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT DEFAULT '',
  reviewer_avatar TEXT DEFAULT '',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  video_thumbnail TEXT DEFAULT '',
  video_title TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reviews are viewable by everyone." ON reviews;
CREATE POLICY "Public reviews are viewable by everyone." ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews USING (auth.role() = 'authenticated');

-- Seed 4 text reviews + 1 video review for demo
INSERT INTO reviews (type, reviewer_name, reviewer_role, reviewer_avatar, rating, review_text, is_featured) VALUES
(
  'text', 'Bhavya Chopra', 'Software Engineer at Infosys',
  '/assets/img/avatar/s1.jpg', 5,
  'SkillifyMe completely transformed my career trajectory. The live mentoring sessions and hands-on projects gave me the confidence to crack my first developer interview. Highly recommend to anyone serious about tech.',
  true
),
(
  'text', 'Heena Mukhreja', 'Frontend Developer at Wipro',
  '/assets/img/avatar/s10.jpg', 5,
  'The workshops are incredibly practical. Unlike online tutorials, here you actually build things and get feedback in real time. Within 3 months of completing the Full Stack program, I had my offer letter.',
  false
),
(
  'text', 'Himanshi Verma', 'Data Analyst at TCS',
  '/assets/img/avatar/s6.jpg', 4,
  'SkillifyMe''s ML pathway is the best structured course I have taken. The curriculum is up-to-date and the mentors genuinely care about your growth. Got placed with a 40% salary hike!',
  false
),
(
  'text', 'Navneet Singh', 'Backend Developer at HCL',
  '/assets/img/avatar/s3.jpg', 5,
  'The DSA bootcamp is brutal in the best way possible. I solved 200+ problems and finally understood dynamic programming. The mock interview sessions are worth every rupee.',
  true
);

-- Note: Add video reviews via Admin → Reviews → Add Review with a YouTube URL.

-- 4. Create contact_info table (single-row company settings)
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT DEFAULT 'contact@skillifyme.co.in',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  country TEXT DEFAULT 'India',
  working_hours TEXT DEFAULT 'Mon–Sat, 9 AM – 7 PM IST',
  linkedin_url TEXT DEFAULT '',
  twitter_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public contact_info is viewable by everyone." ON contact_info;
CREATE POLICY "Public contact_info is viewable by everyone." ON contact_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage contact_info" ON contact_info;
CREATE POLICY "Admins can manage contact_info" ON contact_info USING (auth.role() = 'authenticated');

-- Seed one default row (skip if already exists)
INSERT INTO contact_info (email, phone, address, city, country, working_hours)
VALUES ('contact@skillifyme.co.in', '', '', '', 'India', 'Mon–Sat, 9 AM – 7 PM IST')
ON CONFLICT DO NOTHING;

-- 4. Add new columns to courses table (for existing databases)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.5;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS topics JSONB DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor TEXT DEFAULT 'SkillifyMe Team';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';

-- 4. Seed 3 demo training programs
INSERT INTO courses (title, description, price, original_price, duration, image_url, category, rating, students_count, level, topics, instructor, is_bestseller, language)
VALUES
(
  'Full Stack Web Development',
  'Master modern web development from frontend to backend. Build real-world projects using React, Node.js, MongoDB, and deploy to the cloud. Includes REST APIs, authentication, and CI/CD pipelines.',
  6499,
  7999,
  '48 hours',
  '/assets/img/portfolio/courses/CL2.png',
  'Web Dev',
  4.8,
  2100,
  'Intermediate',
  '["React", "Node.js", "MongoDB", "REST APIs", "Tailwind CSS", "Deployment"]'::jsonb,
  'Rahul Sharma',
  true,
  'English'
),
(
  'Data Structures & Algorithms',
  'A complete DSA course from scratch covering arrays, linked lists, trees, graphs, and dynamic programming. Perfect for cracking FAANG interviews with 200+ practice problems and live doubt sessions.',
  4499,
  5999,
  '36 hours',
  '/assets/img/portfolio/courses/DSA2.png',
  'Programming',
  4.9,
  3500,
  'Beginner',
  '["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Recursion"]'::jsonb,
  'Priya Mehta',
  true,
  'English'
),
(
  'Machine Learning A-Z',
  'Go from zero to hero in Machine Learning. Learn supervised & unsupervised learning, neural networks, and model deployment using Python, Scikit-learn, and TensorFlow with hands-on projects.',
  5499,
  6999,
  '40 hours',
  '/assets/img/portfolio/courses/Ml2.png',
  'AI / ML',
  4.7,
  1800,
  'Intermediate',
  '["Python", "NumPy", "Pandas", "Scikit-learn", "Neural Networks", "Model Deployment"]'::jsonb,
  'Vikram Nair',
  false,
  'English'
);
