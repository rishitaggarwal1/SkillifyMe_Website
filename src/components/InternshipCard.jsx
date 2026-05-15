import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const InternshipCard = ({ internship, index }) => {
  let featuresList = [];
  try {
    if (typeof internship.features === 'string') {
      featuresList = JSON.parse(internship.features);
    } else if (Array.isArray(internship.features)) {
      featuresList = internship.features;
    }
  } catch (e) {
    console.error("Error parsing features:", e);
  }

  // Fallback items if none
  if (!featuresList || featuresList.length === 0) {
    featuresList = ['1:1 Mentorship', 'Real-world Project', 'Certificate of Completion'];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      className="bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.15)] transition-all duration-300 flex flex-col h-full group"
    >
      {/* Top Banner / Image Area */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {internship.image_url ? (
          <img 
            src={internship.image_url} 
            alt={internship.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <span className="text-4xl">🚀</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-6 flex items-center bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium border border-white/30">
          <Clock className="w-4 h-4 mr-2" />
          {internship.duration || 'Flexible Duration'}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
          {internship.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
          {internship.description}
        </p>
        
        <div className="flex-grow mb-8">
          <ul className="space-y-3">
            {featuresList.slice(0, 4).map((feature, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
                <span className="text-slate-600 text-sm font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">Investment</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">₹{internship.price}</span>
                {internship.original_price > internship.price && (
                  <span className="text-sm text-slate-400 line-through decoration-slate-300">₹{internship.original_price}</span>
                )}
              </div>
            </div>
          </div>
          
          <Link 
            to="/apply" 
            className="w-full flex items-center justify-center py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all group/btn relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default InternshipCard;
