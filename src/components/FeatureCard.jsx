import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Terminal, Briefcase, Award } from 'lucide-react';

const FeatureCard = ({ type, title, description, index }) => {
  const getIcon = () => {
    switch (type) {
      case 'ai-coach':
        return <MessageSquare className="w-6 h-6 text-blue-400" />;
      case 'cloud-ide':
        return <Terminal className="w-6 h-6 text-emerald-400" />;
      case 'portfolio':
        return <Briefcase className="w-6 h-6 text-purple-400" />;
      case 'leaderboard':
        return <Award className="w-6 h-6 text-pink-400" />;
      default:
        return <Briefcase className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300 flex flex-col group"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {getIcon()}
      </div>
      <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
