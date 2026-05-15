import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SectionWrapper } from '../components/SectionWrapper';
import InternshipCard from '../components/InternshipCard';
import InternshipFeatureCard from '../components/InternshipFeatureCard';
import ProblemStatementCard from '../components/ProblemStatementCard';
import Loader from '../components/Loader';
import {
  Briefcase,
  Users,
  GraduationCap,
  Award,
  Laptop,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';

const PREMIUM_FEATURES = [
  { icon: Users, title: '1:1 Expert Mentorship', description: 'Get personalized guidance from industry veterans working at top tech companies.' },
  { icon: GraduationCap, title: 'Research with IITians', description: 'Collaborate with peers and mentors from premier institutes like IITs and NITs.' },
  { icon: Award, title: 'Publication Support', description: 'Full assistance in drafting and publishing your research papers in recognized journals.' },
  { icon: Briefcase, title: 'Placement Assistance', description: 'Resume building, mock interviews, and direct referrals to top tech companies.' },
  { icon: Laptop, title: 'Real-world Projects', description: 'Build production-ready applications that solve actual industry problems.' },
  { icon: MessageSquare, title: 'Live Doubt Solving', description: '24/7 dedicated support channels and live sessions to clear your roadblocks instantly.' },
];

const STATS = [
  { value: '1000+', label: 'Students Mentored' },
  { value: '100+', label: 'Projects Completed' },
  { value: '25+', label: 'Research Publications' },
  { value: '100%', label: 'Placement Support' },
];

const Internship = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const fetchInternships = async (retry = true) => {
      try {
        const { data, error } = await supabase
          .from('internships')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        setInternships(data);
      } catch (err) {
        if (err.message && err.message.includes('JWT expired') && retry) {
          console.warn('JWT expired, signing out and retrying...');
          await supabase.auth.signOut();
          fetchInternships(false);
          return;
        }
        setError(err.message);
        console.error('Error fetching internships:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-blue-500/30 overflow-hidden">

      {/* 1. HERO SECTION */}
      <motion.section
        style={{ opacity, scale }}
        className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Glow Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">


          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight"
          >
            Research & Project <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Internships</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Work on real-world problem statements, publish impactful research, and build a standout career with expert 1-on-1 mentorship.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <a href="#programs" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center">
              Explore Programs
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a href="#problem-statements" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center">
              View Problem Statements
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. INTERNSHIP CARDS SECTION */}
      <SectionWrapper id="programs" className="bg-white/50 backdrop-blur-sm border-y border-slate-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Premium Programs</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Select a track to dive deep into cutting-edge technologies and industry practices.</p>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center p-8 bg-red-50 text-red-500 rounded-xl max-w-md mx-auto">
            Error: {error}
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
            <p className="text-slate-500 text-lg">No internships available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {internships.map((internship, index) => (
              <InternshipCard key={internship.id} internship={internship} index={index} />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* 3. PREMIUM FEATURES SECTION */}
      <SectionWrapper id="features">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase mb-4">
            <Target className="w-4 h-4 mr-1" />
            Why SkillifyMe?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The SkillifyMe Advantage</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to transform from a student to an industry-ready professional.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREMIUM_FEATURES.map((feature, index) => (
            <InternshipFeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </SectionWrapper>

      {/* 4. PROBLEM STATEMENTS SECTION */}
      <SectionWrapper id="problem-statements" className="bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Problem Statements</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Preview the exact industry challenges you'll be solving during your internship.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            <div className="text-center text-slate-500 py-10">Loading problem statements...</div>
          ) : internships.filter(i => i.problem_statement_url).length > 0 ? (
            internships.filter(i => i.problem_statement_url).map((internship, index) => (
              <ProblemStatementCard
                key={internship.id}
                index={index}
                internshipName={internship.title}
                description={`A comprehensive set of problem statements covering ${internship.title} fundamentals to advanced concepts.`}
                pdfLink={internship.problem_statement_url}
              />
            ))
          ) : (
            <div className="text-center text-slate-400 py-10">No problem statements uploaded yet. Check back soon!</div>
          )}
        </div>
      </SectionWrapper>

      {/* 5. WHY CHOOSE US (TRUST SECTION) */}
      <SectionWrapper>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200">
          {STATS.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center px-4"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {stat.value}
              </div>
              <div className="text-slate-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* 6. FINAL CTA SECTION */}
      <SectionWrapper className="relative pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl mx-4 sm:mx-6 lg:mx-8 overflow-hidden">
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative z-10 py-20 px-6 text-center text-white">
          <TrendingUp className="w-16 h-16 mx-auto mb-6 text-blue-200 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Start Your Research Journey Today</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Don't just learn. Build, publish, and get hired. Spaces are limited for our upcoming cohort.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/apply"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-300"
            >
              Apply Now
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-blue-700/50 backdrop-blur-sm text-white border border-blue-400/50 rounded-xl font-bold hover:bg-blue-700/70 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </SectionWrapper>

    </div>
  );
};

export default Internship;
