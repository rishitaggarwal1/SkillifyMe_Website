-- SQL setup for Neon Postgres

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  original_price NUMERIC,
  duration TEXT,
  image_url TEXT,
  category TEXT,
  rating NUMERIC DEFAULT 4.5,
  students_count INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Beginner',
  topics JSONB DEFAULT '[]'::jsonb,
  instructor TEXT DEFAULT 'SkillifyMe Team',
  is_bestseller BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Internships Table
CREATE TABLE IF NOT EXISTS internships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  price NUMERIC,
  original_price NUMERIC,
  features JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  problem_statement_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Reviews Table
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

-- 4. Contact Info Table (single-row company settings)
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

-- 5. Contacts Table (form submissions)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college TEXT,
  degree TEXT,
  branch TEXT,
  passout_year TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT students_email_phone_key UNIQUE (email, phone)
);

-- 7. Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'enrolled', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_id TEXT,
  order_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Workshops', 'Projects', 'Internships', 'Certificates')),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Admin Users Table (For Authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admin users are created with: node create-admin.js <email> <password>
-- Remove the old default admin whose password was published in this file
DELETE FROM admin_users
WHERE email = 'admin@skillifyme.co.in'
  AND password_hash = '$2b$10$myRAHrK4EZbPkbhUjCLHIOKt14EWFqUOewDg6siv3kzyIST5W3.8u';

-- 11. Upgrades for databases created before course checkout existed
ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_id TEXT UNIQUE;
ALTER TABLE internships ADD COLUMN IF NOT EXISTS problem_statement_url TEXT;

-- Seed contact_info
INSERT INTO contact_info (email, phone, address, city, country, working_hours)
SELECT 'contact@skillifyme.co.in', '', '', '', 'India', 'Mon–Sat, 9 AM – 7 PM IST'
WHERE NOT EXISTS (SELECT 1 FROM contact_info);

-- Seed courses (only when the table is empty, so this file can be re-run safely)
INSERT INTO courses (title, description, price, original_price, duration, image_url, category, rating, students_count, level, topics, instructor, is_bestseller, language)
SELECT * FROM (VALUES
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
)) AS seed(title, description, price, original_price, duration, image_url, category, rating, students_count, level, topics, instructor, is_bestseller, language)
WHERE NOT EXISTS (SELECT 1 FROM courses);

-- Seed 4 text reviews + 1 video review for demo
INSERT INTO reviews (type, reviewer_name, reviewer_role, reviewer_avatar, rating, review_text, is_featured)
SELECT * FROM (VALUES
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
)) AS seed(type, reviewer_name, reviewer_role, reviewer_avatar, rating, review_text, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM reviews);
