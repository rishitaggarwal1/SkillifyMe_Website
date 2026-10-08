import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Youtube, Mail, MapPin } from 'lucide-react';
import Img from './Img';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-white p-3 rounded-lg">
                <Img 
                  src="/assets/img/logo.png" 
                  alt="SkillifyMe" 
                  className="h-11 object-contain transition-transform duration-300 group-hover:scale-[1.03]" 
                />
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Empowering the next generation of tech leaders with industry-relevant skills, live mentoring, and real-world projects.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-300">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Programs</h3>
            <ul className="space-y-4">
              <li><Link to="/trainings" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">All Courses</Link></li>
              <li><Link to="/trainings" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Masterclasses</Link></li>
              <li><Link to="/internship" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Summer Internships</Link></li>
              <li><Link to="/internship" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Project Mentorship</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Careers</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="mailto:contact@skillifyme.co.in" className="hover:text-blue-400 transition-colors">contact@skillifyme.co.in</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} SkillifyMe. All rights reserved.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
