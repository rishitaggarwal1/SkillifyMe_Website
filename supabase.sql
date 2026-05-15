-- SQL setup for Supabase

-- 1. Courses Table (Existing)
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  original_price NUMERIC,
  duration TEXT,
  image_url TEXT,
  category TEXT,
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

-- 3. Contacts Table (Existing)
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
