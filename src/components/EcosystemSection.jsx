import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';

const EcosystemSection = () => {
  const features = [
    {
      type: 'ai-coach',
      title: 'AI Interview Coach',
      description: 'Practice real interviews with AI-driven feedback and performance analysis.',
    },
    {
      type: 'cloud-ide',
      title: 'Cloud IDE',
      description: 'Start coding instantly with our powerful browser-based integrated development environment.',
    },
    {
      type: 'portfolio',
      title: 'Project Portfolio',
      description: 'Automatically build a professional showcase of your projects for potential recruiters.',
    },
    {
      type: 'leaderboard',
      title: 'Skill Leaderboards',
      description: 'Compete with top talent globally and prove your technical expertise in real-time rankings.',
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-slate-900">
      {/* Background Gradients/Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-4">
            The Complete Ecosystem
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Everything You Need For{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Tech Excellence
            </span>
          </h3>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We provide more than just courses. Our platform is a comprehensive growth engine designed to take you from beginner to professional.
          </p>
        </motion.div>

        {/* Responsive Grid: 1 column mobile, 2 tablet, 4 desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.type}
              index={index}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
