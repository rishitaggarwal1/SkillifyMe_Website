import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink } from 'lucide-react';

const ProblemStatementCard = ({ internshipName, description, pdfLink, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group"
    >
      <div className="flex items-start gap-4 flex-1">
        <div className="p-3 bg-red-50 rounded-xl text-red-500 shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">{internshipName}</h4>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
      </div>
      
      <a
        href={pdfLink}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 hover:text-blue-600 transition-colors group-hover:underline decoration-blue-600 underline-offset-4"
      >
        <span>View PDF</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
};

export default ProblemStatementCard;
