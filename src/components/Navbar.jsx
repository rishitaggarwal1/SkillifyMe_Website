import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, ChevronDown, Cpu, Database, Code, Globe, Building2, Briefcase, GraduationCap, Presentation, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const dropdownTimerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileDropdownOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = (name) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200); // Small delay to prevent accidental closing
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Trainings', hasDropdown: true },
    { name: 'Internships', path: '/internship' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  const studentCourses = [
    { name: 'AI & Machine Learning', path: '/trainings?category=AI%20/%20ML', icon: <Cpu className="w-5 h-5" />, desc: 'Master AI algorithms and ML models' },
    { name: 'Data Science', path: '/trainings?category=Data%20Science', icon: <Database className="w-5 h-5" />, desc: 'Analyze and visualize complex data' },
    { name: 'Full Stack Dev', path: '/trainings?category=Web%20Dev', icon: <Code className="w-5 h-5" />, desc: 'Build modern web applications' },
    { name: 'Cloud Computing', path: '/trainings?category=Cloud', icon: <Globe className="w-5 h-5" />, desc: 'Deploy and scale on the cloud' },
  ];

  const institutionPrograms = [
    { name: 'Summer/Winter Training', path: '/institution-training', icon: <GraduationCap className="w-5 h-5" />, desc: 'Project-based semester breaks' },
    { name: 'Placement Programs', path: '/institution-training', icon: <Briefcase className="w-5 h-5" />, desc: 'Intensive readiness training' },
    { name: 'Faculty Development', path: '/institution-training', icon: <Presentation className="w-5 h-5" />, desc: 'Upskilling for faculty members' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent flex items-center ${isScrolled || activeDropdown
          ? 'h-20 bg-white/90 backdrop-blur-lg shadow-sm border-slate-200/50'
          : 'h-24 bg-transparent'
          }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 z-50 group h-full py-1">
              <div className="relative flex items-center h-full">
                <img
                  src="/assets/img/logo.png"
                  alt="SkillifyMe"
                  className="h-[90%] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="hidden text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight transition-transform duration-300 group-hover:scale-[1.03]">
                  SkillifyMe
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 h-full">
              <div className="flex space-x-6 h-full items-center">
                {navLinks.map((link) => (
                  link.hasDropdown ? (
                    <div
                      key={link.name}
                      className="h-full flex items-center cursor-pointer"
                      onMouseEnter={() => handleMouseEnter(link.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 ${activeDropdown === link.name || location.pathname.includes('/trainings') || location.pathname.includes('/institution')
                          ? 'text-blue-600'
                          : isScrolled ? 'text-slate-700 hover:text-blue-600' : 'text-slate-800 hover:text-blue-600'
                          }`}
                      >
                        {link.name}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Mega Menu Dropdown */}
                      <AnimatePresence>
                        {activeDropdown === link.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mx-auto mt-2 w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/50 overflow-hidden"
                          >
                            <div className="grid grid-cols-5 p-2">
                              {/* Left Column: Student Trainings */}
                              <div className="col-span-3 bg-white p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-blue-600" /> Student Trainings
                                  </h3>
                                  <Link to="/trainings" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                                    View all courses <ChevronRight className="w-3 h-3" />
                                  </Link>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  {studentCourses.map((course) => (
                                    <Link
                                      key={course.name}
                                      to={course.path}
                                      className="group flex flex-col gap-2 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                          {course.icon}
                                        </div>
                                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{course.name}</h4>
                                      </div>
                                      <p className="text-xs text-slate-500 pl-[3.25rem]">{course.desc}</p>
                                    </Link>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column: Institution Partnerships */}
                              <div className="col-span-2 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-xl border-l border-slate-100/50">
                                <div className="flex items-center justify-between mb-6 border-b border-slate-200/50 pb-2">
                                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-indigo-600" /> For Institutions
                                  </h3>
                                </div>
                                <div className="flex flex-col gap-2 mb-6">
                                  {institutionPrograms.map((prog) => (
                                    <Link
                                      key={prog.name}
                                      to={prog.path}
                                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                                    >
                                      <div className="text-indigo-600 group-hover:scale-110 transition-transform mt-0.5">
                                        {prog.icon}
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{prog.name}</div>
                                        <div className="text-xs text-slate-500">{prog.desc}</div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                                <Link
                                  to="/institution-training"
                                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                  Partner with Us <ChevronRight className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`text-sm font-semibold transition-colors duration-200 ${location.pathname === link.path
                        ? 'text-blue-600'
                        : isScrolled ? 'text-slate-700 hover:text-blue-600' : 'text-slate-800 hover:text-blue-600'
                        }`}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>

              <Link
                to="/trainings"
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                Get Started
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-50">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 -mr-2 rounded-md transition-colors ${isScrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-slate-900 hover:bg-white/20'
                  }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-4 sm:px-6 md:hidden overflow-y-auto pb-20"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                link.hasDropdown ? (
                  <div key={link.name} className="flex flex-col rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                      className={`flex items-center justify-between p-4 text-2xl font-bold transition-colors ${mobileDropdownOpen || location.pathname.includes('/trainings') || location.pathname.includes('/institution')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      {link.name}
                      <ChevronDown className={`w-6 h-6 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {mobileDropdownOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-slate-50 overflow-hidden"
                        >
                          <div className="p-4 space-y-6">
                            <div>
                              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> Students
                              </h4>
                              <div className="grid grid-cols-1 gap-2">
                                <Link to="/trainings" className="font-semibold text-slate-800 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                  All Courses
                                </Link>
                                {studentCourses.map(course => (
                                  <Link key={course.name} to={course.path} className="text-sm font-medium text-slate-600 p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ml-2">
                                    {course.name}
                                  </Link>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Institutions
                              </h4>
                              <div className="grid grid-cols-1 gap-2">
                                <Link to="/institution-training" className="font-semibold text-indigo-700 p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-colors flex items-center justify-between">
                                  Institution Partnerships <ArrowRight className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-2xl font-bold p-4 rounded-2xl transition-colors ${location.pathname === link.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <div className="pt-6 mt-4 border-t border-slate-100">
                <Link
                  to="/trainings"
                  className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20"
                >
                  Get Started Today
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
