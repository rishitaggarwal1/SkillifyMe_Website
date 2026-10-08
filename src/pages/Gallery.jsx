import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Image } from 'lucide-react';
import Img from '../components/Img';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const categories = ['All', 'Workshops', 'Projects', 'Internships', 'Certificates'];

const galleryItems = [
  {
    id: 1,
    src: '/assets/img/portfolio/courses/CL2.png',
    fallback: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    title: 'Full Stack Web Dev Workshop',
    category: 'Workshops',
    span: 'row-span-2',
  },
  {
    id: 2,
    src: '/assets/img/portfolio/courses/DSA2.png',
    fallback: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    title: 'DSA Bootcamp Session',
    category: 'Workshops',
    span: '',
  },
  {
    id: 3,
    src: '/assets/img/portfolio/courses/Ml2.png',
    fallback: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80',
    title: 'Machine Learning Projects',
    category: 'Projects',
    span: '',
  },
  {
    id: 4,
    src: '/assets/img/portfolio/courses/ML1.png',
    fallback: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    title: 'AI Research Internship',
    category: 'Internships',
    span: 'row-span-2',
  },
  {
    id: 5,
    src: '/assets/img/portfolio/courses/DSA1.png',
    fallback: 'https://images.unsplash.com/photo-1606159068539-43f36b99d1b2?auto=format&fit=crop&w=800&q=80',
    title: 'Competitive Programming',
    category: 'Projects',
    span: '',
  },
  {
    id: 6,
    src: '/assets/img/portfolio/courses/CL1.png',
    fallback: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    title: 'Live Mentorship Session',
    category: 'Workshops',
    span: '',
  },
  {
    id: 7,
    src: '/assets/img/portfolio/courses/DSACL1.png',
    fallback: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    title: 'DSA + Cloud Program',
    category: 'Certificates',
    span: 'row-span-2',
  },
  {
    id: 8,
    src: '/assets/img/portfolio/courses/ML3.png',
    fallback: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    title: 'ML Internship Project',
    category: 'Internships',
    span: '',
  },
  {
    id: 9,
    src: '/assets/img/portfolio/courses/DSAMLCL1.png',
    fallback: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=80',
    title: 'Full Combo Certificate',
    category: 'Certificates',
    span: '',
  },
  {
    id: 10,
    src: '/assets/img/portfolio/courses/01.jpg',
    fallback: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    title: 'Student Project Demo',
    category: 'Projects',
    span: '',
  },
  {
    id: 11,
    src: '/assets/img/portfolio/courses/02.jpg',
    fallback: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    title: 'Cohort Kickoff Event',
    category: 'Workshops',
    span: 'row-span-2',
  },
  {
    id: 12,
    src: '/assets/img/portfolio/courses/03.jpg',
    fallback: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=800&q=80',
    title: 'Internship Certificate Day',
    category: 'Certificates',
    span: '',
  },
  {
    id: 13,
    src: '/assets/img/portfolio/courses/04.jpg',
    fallback: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
    title: 'Backend Dev Internship',
    category: 'Internships',
    span: '',
  },
  {
    id: 14,
    src: '/assets/img/portfolio/courses/05.jpg',
    fallback: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
    title: 'Capstone Project Showcase',
    category: 'Projects',
    span: '',
  },
  {
    id: 15,
    src: '/assets/img/portfolio/courses/06.jpg',
    fallback: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=800&q=80',
    title: 'Resume & Interview Prep',
    category: 'Workshops',
    span: '',
  },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const filtered =
    activeCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Hero Header */}
      <section className="relative py-24 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl opacity-60" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-indigo-50 blur-3xl opacity-60" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-bold tracking-wider uppercase text-xs px-4 py-2 rounded-full mb-6">
              <Image className="w-4 h-4" />
              Our Gallery
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Moments That Define{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Our Community
              </span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              From live workshops to internship milestones — explore the highlights of our
              students' journeys and the vibrant SkillifyMe community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-[80px] z-30 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[220px]"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  onClick={() => setLightbox(item)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-slate-100 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-shadow duration-300 ${item.span}`}
                >
                  <Img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = item.fallback; }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                      {item.category}
                    </span>
                    <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-slate-400">
              <Image className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No items in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <Img
                src={lightbox.src}
                alt={lightbox.title}
                className="w-full max-h-[70vh] object-contain bg-slate-800"
                onError={(e) => { e.target.src = lightbox.fallback; }}
              />
              <div className="p-6 flex items-center justify-between">
                <div>
                  <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                    {lightbox.category}
                  </span>
                  <h3 className="text-white font-bold text-lg">{lightbox.title}</h3>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Gallery;
