import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Code, Cpu, Sparkles, Layers } from 'lucide-react';

const HeroImages = () => {
  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for parallax
  const springConfig = { damping: 50, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transformations for different depths
  const moveBgX = useTransform(smoothX, [-0.5, 0.5], [15, -15]);
  const moveBgY = useTransform(smoothY, [-0.5, 0.5], [15, -15]);

  const moveMidX = useTransform(smoothX, [-0.5, 0.5], [25, -25]);
  const moveMidY = useTransform(smoothY, [-0.5, 0.5], [25, -25]);

  const moveFgX = useTransform(smoothX, [-0.5, 0.5], [40, -40]);
  const moveFgY = useTransform(smoothY, [-0.5, 0.5], [40, -40]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates from -0.5 to 0.5
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative w-full h-[500px] lg:h-[650px] flex items-center justify-center pointer-events-none hidden sm:flex">

      {/* --- Image 1: Collaborative Learning (Top Right - Background) --- */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        style={{ x: moveBgX, y: moveBgY }}
        className="absolute right-0 lg:-right-4 top-4 lg:top-10 w-48 lg:w-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white pointer-events-auto z-0"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="relative group h-full"
        >
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
            alt="Collaborative Learning"
            className="w-full h-32 lg:h-40 object-cover rounded-[14px] transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.div>
      </motion.div>

      {/* --- Image 2: Main Student Coding (Center - Midground) --- */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ x: moveMidX, y: moveMidY }}
        className="relative z-10 w-72 lg:w-[26rem] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-8 border-white pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative group bg-white"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent z-10 pointer-events-none"></div>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
            alt="Student coding on laptop"
            className="w-full h-[320px] lg:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </motion.div>
      </motion.div>

      {/* --- Image 3: Code Editor Screen (Bottom Left - Foreground) --- */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        style={{ x: moveFgX, y: moveFgY }}
        className="absolute left-0 lg:-left-8 bottom-16 lg:bottom-24 w-40 lg:w-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white pointer-events-auto z-20"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="relative group bg-slate-900"
        >
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
            alt="Code Editor Screen"
            className="w-full h-28 lg:h-36 object-cover rounded-[14px] transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />
        </motion.div>
      </motion.div>

      {/* --- Image 4: Career / Interview (Bottom Right - Foreground) --- */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        style={{ x: moveFgX, y: moveFgY }}
        className="absolute right-4 lg:right-6 bottom-4 lg:bottom-10 w-32 lg:w-40 rounded-full overflow-hidden shadow-2xl border-4 border-white pointer-events-auto z-20 aspect-square"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="relative group h-full w-full"
        >
          <img
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=500&q=80"
            alt="Career Growth Interview"
            className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors duration-300"></div>
        </motion.div>
      </motion.div>


      {/* --- Floating Badges (Glassmorphism Pills) --- */}

      {/* Web Dev Badge */}
      <motion.div
        style={{ x: moveFgX, y: moveFgY }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-4 lg:-left-12 top-1/3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-white flex items-center gap-2.5 z-30 pointer-events-auto hover:scale-110 transition-transform"
      >
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Code className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-bold text-slate-800 pr-1">Web Dev</span>
      </motion.div>

      {/* AI Badge */}
      <motion.div
        style={{ x: moveMidX, y: moveMidY }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        className="absolute right-0 lg:right-10 top-1/4 lg:top-1/3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-white flex items-center gap-2.5 z-30 pointer-events-auto hover:scale-110 transition-transform"
      >
        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
          <Cpu className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-bold text-slate-800 pr-1">AI/ML</span>
      </motion.div>

      {/* Live Projects Badge */}
      <motion.div
        style={{ x: moveBgX, y: moveBgY }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute left-1/4 -top-6 lg:-top-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/80 flex items-center gap-2 z-10 pointer-events-auto hover:scale-110 transition-transform"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-bold text-slate-800">Live Projects</span>
      </motion.div>

      {/* ML Badge */}
      <motion.div
        style={{ x: moveFgX, y: moveFgY }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
        className="absolute right-1/4 -bottom-2 lg:-bottom-6 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-slate-700 flex items-center gap-2 z-30 pointer-events-auto hover:scale-110 transition-transform"
      >
        <Layers className="w-3.5 h-3.5 text-pink-400" />
        <span className="text-xs font-bold text-white">Cloud/DevOps</span>
      </motion.div>

    </div>
  );
};

export default HeroImages;
