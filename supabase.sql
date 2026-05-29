-- SQL setup for Supabase

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
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON courses;
CREATE POLICY "Public profiles are viewable by everyone." ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses" ON courses USING (auth.role() = 'authenticated');

-- 2. Internships Table (Updated)
CREATE TABLE IF NOT EXISTS internships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  price NUMERIC,
  original_price NUMERIC,
  features JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public internships are viewable by everyone." ON internships;
CREATE POLICY "Public internships are viewable by everyone." ON internships FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage internships" ON internships;
CREATE POLICY "Admins can manage internships" ON internships USING (auth.role() = 'authenticated');

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
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reviews are viewable by everyone." ON reviews;
CREATE POLICY "Public reviews are viewable by everyone." ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews USING (auth.role() = 'authenticated');

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
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public contact_info is viewable by everyone." ON contact_info;
CREATE POLICY "Public contact_info is viewable by everyone." ON contact_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage contact_info" ON contact_info;
CREATE POLICY "Admins can manage contact_info" ON contact_info USING (auth.role() = 'authenticated');

-- 4. Contacts Table (form submissions)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert a contact form." ON contacts;
CREATE POLICY "Anyone can insert a contact form." ON contacts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Only authenticated users can view contacts." ON contacts;
CREATE POLICY "Only authenticated users can view contacts." ON contacts FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  college TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage students" ON students;
CREATE POLICY "Admins can manage students" ON students USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Anyone can insert a student." ON students;
CREATE POLICY "Anyone can insert a student." ON students FOR INSERT WITH CHECK (true);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'enrolled', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage applications" ON applications;
CREATE POLICY "Admins can manage applications" ON applications USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Anyone can insert an application." ON applications;
CREATE POLICY "Anyone can insert an application." ON applications FOR INSERT WITH CHECK (true);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
CREATE POLICY "Admins can manage payments" ON payments USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Anyone can insert a payment." ON payments;
CREATE POLICY "Anyone can insert a payment." ON payments FOR INSERT WITH CHECK (true);

-- 7. Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Workshops', 'Projects', 'Internships', 'Certificates')),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public gallery is viewable by everyone." ON gallery_items;
CREATE POLICY "Public gallery is viewable by everyone." ON gallery_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery_items;
CREATE POLICY "Admins can manage gallery" ON gallery_items USING (auth.role() = 'authenticated');

-- Storage bucket for gallery images (run once in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;
