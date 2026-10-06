import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import { Search, SlidersHorizontal, BookOpen, Users, Award, X } from 'lucide-react';

const CATEGORIES = ['All', 'Web Dev', 'AI / ML', 'Programming', 'Cloud', 'Data Science', 'DevOps'];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Trainings = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = useMemo(() => {
    let result = [...courses];

    if (activeCategory !== 'All') {
      result = result.filter((c) => c.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.instructor?.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'popular':
        result.sort((a, b) => (b.students_count || 0) - (a.students_count || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    return result;
  }, [courses, activeCategory, search, sort]);

  const totalStudents = courses.reduce((acc, c) => acc + (c.students_count || 0), 0);

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative bg-slate-950 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-500 to-transparent blur-[120px]" />
          <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500 to-transparent blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <span className="inline-block text-blue-400 font-bold tracking-wider uppercase text-sm mb-4">
              All Programs
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight leading-tight">
              Expand Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Skills
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Expert-led, industry-aligned training programs designed to make you job-ready. Learn at your own pace.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-2xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title, topic, or instructor…"
              className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15 transition-all text-base"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>

          {/* Hero stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-10 text-slate-400 text-sm"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              {courses.length}+ Courses
            </span>
            <span className="w-px h-4 bg-slate-700" />
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              {(totalStudents).toLocaleString('en-IN')}+ Students
            </span>
            <span className="w-px h-4 bg-slate-700" />
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Verified Certificates
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-slate-500 hidden sm:block">
              {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-3 py-1.5">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Course Grid ── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-center p-8 bg-red-50 text-red-500 rounded-2xl max-w-md mx-auto border border-red-100">
              Failed to load courses.
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No courses found</h3>
              <p className="text-slate-500 mb-6">
                {search ? `No results for "${search}"` : 'No courses in this category yet.'}
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Trainings;