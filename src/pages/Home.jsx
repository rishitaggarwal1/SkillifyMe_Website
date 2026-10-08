import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  PlayCircle,
  ChevronRight,
  Users,
  Briefcase,
  Award,
  BookOpen,
  CheckCircle2,
  Star,
  ArrowRight,
  Code,
  Cpu,
  Monitor
} from 'lucide-react';
import EcosystemSection from '../components/EcosystemSection';
import HeroSection from '../components/HeroSection';
import Img from '../components/Img';

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

// --- Data ---
const features = [
  { icon: <Monitor className="w-6 h-6 text-blue-600" />, title: "Live Training", desc: "Interactive sessions with industry experts to guide your learning." },
  { icon: <Briefcase className="w-6 h-6 text-indigo-600" />, title: "Industry Projects", desc: "Work on real-world projects that mimic actual company scenarios." },
  { icon: <Award className="w-6 h-6 text-purple-600" />, title: "Certification", desc: "Earn verified certificates recognized by top tech companies." },
  { icon: <Users className="w-6 h-6 text-pink-600" />, title: "Career Support", desc: "Resume building, mock interviews, and placement assistance." },
];

const courses = [
  {
    id: 1,
    title: "Full Stack Web Development",
    category: "Web Dev",
    image: "/assets/img/portfolio/courses/CL2.png", // Using existing image name from old code
    price: "₹6,499",
    oldPrice: "₹7,999",
    rating: 4.8,
    students: "2.1k+"
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    category: "Programming",
    image: "/assets/img/portfolio/courses/DSA2.png",
    price: "₹4,499",
    oldPrice: "₹4,999",
    rating: 4.9,
    students: "3.5k+"
  },
  {
    id: 3,
    title: "Machine Learning Pathway",
    category: "AI / ML",
    image: "/assets/img/portfolio/courses/Ml2.png",
    price: "₹5,499",
    oldPrice: "₹6,999",
    rating: 4.7,
    students: "1.8k+"
  }
];

const testimonials = [
  { name: "Bhavya Chopra", role: "Software Engineer", text: "SkillifyMe transformed my career trajectory with their live mentoring and technical workshops. Their guidance propelled me towards my dream job.", avatar: "/assets/img/avatar/s1.jpg" },
  { name: "Heena Mukhreja", role: "Frontend Developer", text: "Their workshops provided hands-on experience and guidance tailored to my goals. With their support, I confidently navigated the job market.", avatar: "/assets/img/avatar/s10.jpg" },
  { name: "Himanshi", role: "Data Analyst", text: "SkillifyMe's live mentoring and workshops are game-changers. They've empowered me to steer my career in the right direction.", avatar: "/assets/img/avatar/s6.jpg" },
  { name: "Navneet", role: "Backend Developer", text: "Their interactive workshops and personalized guidance helped me carve a clear career path. I landed a job that aligns with my ambitions.", avatar: "/assets/img/avatar/s3.jpg" },
];

const Counter = ({ from, to, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(from + (to - from) * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };
    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return <span>{count}{suffix}</span>;
};

const Home = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="bg-slate-50 min-h-screen overflow-hidden font-sans">

      {/* --- HERO SECTION --- */}
      <HeroSection />

      {/* --- TRUST SECTION --- */}
      <section className="py-10 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center divide-x divide-slate-100">
            <div className="px-4">
              <h3 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-1">
                <Counter from={0} to={1000} suffix="+" />
              </h3>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">Students Trained</p>
            </div>
            <div className="px-4">
              <h3 className="text-3xl md:text-4xl font-extrabold text-indigo-600 mb-1">
                <Counter from={0} to={50} suffix="+" />
              </h3>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">Industry Mentors</p>
            </div>
            <div className="px-4">
              <h3 className="text-3xl md:text-4xl font-extrabold text-purple-600 mb-1">
                <Counter from={0} to={100} suffix="+" />
              </h3>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">Live Projects</p>
            </div>
            <div className="px-4">
              <h3 className="text-3xl md:text-4xl font-extrabold text-purple-600 mb-1">
                <Counter from={0} to={25} suffix="+" />
              </h3>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">Research Publications</p>
            </div>
            <div className="px-4">
              <h3 className="text-3xl md:text-4xl font-extrabold text-pink-600 mb-1">
                <Counter from={0} to={95} suffix="%" />
              </h3>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">Placement Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Why Choose Us</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h3>
            <p className="text-slate-600 text-lg">Our platform provides a complete ecosystem for your learning and career growth.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1, duration: 0.5 } }
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ECOSYSTEM GROWTH SECTION --- */}
      <EcosystemSection />

      {/* --- COURSES PREVIEW SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="max-w-2xl"
            >
              <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Top Programs</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Explore Our Popular Courses</h3>
              <p className="text-slate-600 text-lg">Industry-curated curriculum designed to make you job-ready.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/trainings" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                View All Courses <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { delay: idx * 0.1, duration: 0.5 } }
                }}
                className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <Img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80' }}
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold rounded-full text-blue-600 shadow-sm">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center text-amber-500 font-medium">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {course.rating}
                    </div>
                    <div className="text-slate-500 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students}
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h4>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900">{course.price}</span>
                      <span className="text-sm text-slate-400 line-through ml-2">{course.oldPrice}</span>
                    </div>
                    <Link to="/trainings" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- INTERNSHIP SECTION --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-950 z-0"></div>
        {/* Abstract shapes */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-blue-500 to-transparent blur-[100px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-purple-500 to-transparent blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-blue-400 font-bold tracking-wider uppercase text-sm mb-3">Accelerate Your Career</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Project / Research <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Internships</span>
              </h3>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Stop watching tutorials. Start building real applications. Join our immersive internship programs designed to give you practical experience working on industry-level projects under expert mentorship.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  "1-on-1 Mentorship from Industry Experts",
                  "Build 3+ Production-Ready Projects",
                  "Certificate of Internship Experience",
                  "Pre-Placement Offers for Top Performers"
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center text-slate-200"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>

              <Link to="/internship" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-2xl hover:bg-blue-50 transition-colors">
                Apply for Internship
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Glass Card Representation */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl relative z-10">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transform rotate-12">
                  Hiring Now!
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <Code className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Full Stack Dev</h4>
                    <p className="text-blue-300">Summer Internship Cohort</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between text-sm text-slate-300 mb-2">
                      <span>Duration</span>
                      <span className="font-semibold text-white">3 Months</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full w-1/3"></div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between text-sm text-slate-300 mb-2">
                      <span>Spots Filled</span>
                      <span className="font-semibold text-white">85%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="bg-pink-500 h-1.5 rounded-full w-[85%]"></div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25">
                  Secure Your Spot
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Student Success</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Loved by thousands of learners</h3>
          </motion.div>

          {/* Marquee effect wrapper */}
          <div className="relative flex overflow-x-hidden group pb-10">
            {/* Gradient masks for smooth edges */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 30, repeat: Infinity }}
              className="flex gap-6 px-6 whitespace-nowrap"
              style={{ width: "fit-content" }}
            >
              {/* Duplicate array to create seamless loop */}
              {[...testimonials, ...testimonials].map((t, idx) => (
                <div
                  key={idx}
                  className="w-[350px] sm:w-[400px] flex-shrink-0 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 whitespace-normal"
                >
                  <div className="flex text-amber-400 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <p className="text-slate-700 text-lg mb-8 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <Img
                      src={t.avatar}
                      alt={t.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(t.name) + '&background=0D8ABC&color=fff' }}
                    />
                    <div>
                      <h5 className="font-bold text-slate-900">{t.name}</h5>
                      <span className="text-sm text-slate-500">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* Decorative background patterns */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Start Your Tech Journey Today</h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful students who have transformed their careers with our premium courses and internships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/trainings" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-2xl hover:bg-slate-50 transition-colors shadow-lg">
                Join Now
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white border-2 border-white/20 rounded-2xl hover:bg-white/10 transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
