import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const taglines = [
  {
    text: "Learn the Skills. Build the Proof. Get the Career.",
    highlight: ["Skills.", "Proof.", "Career."]
  },
  {
    text: "The Smart Way to Break Into Tech",
    highlight: ["Smart", "Way", "Tech"]
  },
  {
    text: "Your Career Deserves More Than Theory.",
    highlight: ["Career", "More", "Theory."]
  }
];

const AnimatedTagline = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % taglines.length);
    }, 3000); // switch every 3 seconds

    return () => clearInterval(timer);
  }, []);

  // Helper to render text with highlighted keywords
  const renderHighlightedText = (tagline) => {
    // We split the text into words and check if it matches a highlight word
    const words = tagline.text.split(' ');
    
    return words.map((word, i) => {
      // Check if word (with or without punctuation) matches highlight array
      const isHighlight = tagline.highlight.some(h => word.includes(h));
      
      return (
        <span key={i} className={isHighlight ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" : ""}>
          {word}{' '}
        </span>
      );
    });
  };

  return (
    <div className="relative h-[120px] sm:h-[140px] md:h-[180px] lg:h-[200px] w-full flex items-center justify-center lg:justify-start">
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute text-4xl md:text-5xl lg:text-[4rem] font-extrabold text-slate-900 tracking-tight leading-[1.1]"
        >
          {renderHighlightedText(taglines[currentIndex])}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedTagline;
