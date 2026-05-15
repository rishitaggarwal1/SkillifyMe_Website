import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import HeroImages from './HeroImages';
import AnimatedTagline from './AnimatedTagline';

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

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* --- Premium Background Enhancement --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft gradient base overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30"></div>
        
        {/* Animated Background Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/10 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-purple-400/20 to-pink-500/10 blur-[120px]"
        />

        {/* Optional: Light Particles / Grid pattern overlay to add texture */}
        <div className="absolute inset-0 bg-[url('/assets/img/grid-pattern.svg')] opacity-[0.03] bg-repeat"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left z-20"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <AnimatedTagline />
            </motion.div>

            <motion.p 
              variants={fadeInUp} 
              className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Live training, real-world projects, and internships designed to turn your learning into a successful tech career.
            </motion.p>

            <motion.div 
              variants={fadeInUp} 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link 
                to="/trainings" 
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-blue-600 rounded-2xl hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] overflow-hidden hover:scale-[1.03]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Programs
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 h-full w-0 bg-white/20 transition-[width] group-hover:w-full ease-out duration-300"></div>
              </Link>

              <Link 
                to="/contact" 
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 transition-all duration-300 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-blue-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:text-blue-600 hover:scale-[1.03]"
              >
                <PlayCircle className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                Start Learning
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image Composition */}
          <div className="relative w-full z-10">
            {/* Mobile Fallback image (simplified, less heavy animations) */}
            <div className="block sm:hidden w-full max-w-sm mx-auto relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white mt-8">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                src="/assets/img/landing/online-courses/signup-img.jpg" 
                alt="Student learning" 
                className="w-full h-auto object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80' }}
              />
            </div>
            
            {/* Desktop Dynamic Layered Component */}
            <HeroImages />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
