import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  Building2, GraduationCap, Users, BookOpen, Presentation, 
  Briefcase, Code, Database, Globe, Lock, Cpu, Server, 
  Settings, CheckCircle2, ChevronDown, ArrowRight, Star
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const InstitutionTraining = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 -z-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Building2 className="w-4 h-4" /> B2B Partnerships
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Industry-Aligned Training Programs for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Colleges & Universities</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Empower your students with industry-relevant skills through customizable training programs, workshops, and placement-focused learning experiences delivered by SkillifyMe.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#callback-form" className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                Schedule a Callback <ArrowRight className="w-4 h-4" />
              </a>
              <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 rounded-full font-semibold hover:bg-slate-50 border border-slate-200 shadow-sm transition-all">
                Download Brochure
              </button>
            </div>
            
            <div className="mt-16 pt-8 border-t border-slate-200/60 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /><span className="font-medium text-slate-700">Industry Experts</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /><span className="font-medium text-slate-700">Customizable Curriculum</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /><span className="font-medium text-slate-700">Placement Focused</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /><span className="font-medium text-slate-700">Hands-On Learning</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Institutional Offerings</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Comprehensive training solutions tailored to fit your academic calendar and institutional goals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<GraduationCap className="w-8 h-8 text-blue-600" />}
              title="Summer / Winter Industrial Training"
              description="Hands-on project-based training during semester breaks to bridge the gap between academia and industry."
            />
            <ServiceCard 
              icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
              title="Semester Long Training Programs"
              description="Integrated skill development programs aligned with academic semesters for continuous learning."
            />
            <ServiceCard 
              icon={<Briefcase className="w-8 h-8 text-purple-600" />}
              title="Placement Preparation Programs"
              description="6-Month and 1-Year intensive placement readiness training including aptitude, coding, soft skills, and mock interviews."
            />
            <ServiceCard 
              icon={<Users className="w-8 h-8 text-cyan-600" />}
              title="Faculty Development Programs (FDP)"
              description="Upskilling and certification programs for faculty members on emerging technologies to stay ahead of the curve."
            />
            <ServiceCard 
              icon={<Presentation className="w-8 h-8 text-rose-600" />}
              title="Technical Workshops & Bootcamps"
              description="Short-term intensive workshops on AI, Data Science, Cloud, Cybersecurity, IoT, and more."
            />
          </div>
        </div>
      </section>

      {/* Why Institutions Choose SkillifyMe */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Institutions Choose SkillifyMe</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We partner with you to deliver measurable outcomes and elevate your institution's placement records.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard title="Fully Customizable Programs" description="Training duration, content, projects, delivery mode, and assessments can be tailored according to institutional requirements." />
            <FeatureCard title="Industry-Oriented Curriculum" description="Designed by professionals and aligned with current hiring trends to ensure maximum employability." />
            <FeatureCard title="Dedicated Mentorship" description="Continuous support from industry experts and dedicated trainers throughout the learning journey." />
            <FeatureCard title="Placement Support" description="Comprehensive career guidance, resume reviews, interview preparation, and dedicated placement assistance." />
            <FeatureCard title="Certifications" description="Industry-recognized certificates upon completion that add significant value to students' profiles." />
            <FeatureCard title="Hybrid Delivery" description="Flexible delivery models including Online, Offline, and Hybrid training available to suit your needs." />
          </div>
        </div>
      </section>

      {/* Training Domains */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Training Domains</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We offer comprehensive training in the most in-demand technologies.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <DomainCard icon={<Cpu />} name="AI & ML" />
            <DomainCard icon={<Database />} name="Data Science" />
            <DomainCard icon={<Globe />} name="Gen AI" />
            <DomainCard icon={<Code />} name="Full Stack" />
            <DomainCard icon={<Server />} name="Cloud Computing" />
            <DomainCard icon={<Lock />} name="Cyber Security" />
            <DomainCard icon={<Settings />} name="DevOps" />
            <DomainCard icon={<Cpu />} name="IoT" />
            <DomainCard icon={<Database />} name="Blockchain" />
            <DomainCard icon={<Globe />} name="Mobile Dev" />
            <DomainCard icon={<Code />} name="UI/UX Design" />
            <DomainCard icon={<Server />} name="System Design" />
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Partnership Process</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">A streamlined approach to integrate our training programs into your institution.</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 -ml-0.5 w-0.5 h-full bg-slate-200 hidden md:block"></div>
            <div className="space-y-12">
              <TimelineStep 
                number="01" 
                title="Requirement Discussion" 
                description="We start by understanding your institution's specific needs, academic calendar, and student demographics." 
                align="left" 
              />
              <TimelineStep 
                number="02" 
                title="Customized Training Plan" 
                description="Our experts design a tailored curriculum, proposing the ideal duration, delivery mode, and specific technology stacks." 
                align="right" 
              />
              <TimelineStep 
                number="03" 
                title="Program Execution" 
                description="Expert trainers deliver the program via interactive sessions, hands-on labs, and real-world projects." 
                align="left" 
              />
              <TimelineStep 
                number="04" 
                title="Assessment & Certification" 
                description="Rigorous evaluation through projects and tests, followed by the awarding of industry-recognized certificates." 
                align="right" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Trusted by Leading Institutions</h2>
              <p className="text-lg text-slate-600 mb-8">SkillifyMe has empowered thousands of students across numerous colleges and universities, bridging the academia-industry gap effectively.</p>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Students Trained</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Institution Collabs</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Training Batches</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <TestimonialCard 
                quote="The structured placement preparation program provided by SkillifyMe drastically improved our students' coding rounds clearance rate."
                author="Dr. Rakesh Sharma"
                role="Director, T&P Cell"
              />
              <TestimonialCard 
                quote="The customized AI & ML winter training was exceptional. The hands-on projects were exactly what our students needed to grasp complex concepts."
                author="Prof. Anita Desai"
                role="HOD Computer Science"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Callback Form */}
      <section id="callback-form" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
              <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Let's Discuss Your Needs</h3>
                <p className="text-blue-100 mb-8">Fill out the form and our academic partnership team will contact you within 24 hours to discuss how we can help your institution.</p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Global Standard</div>
                      <div className="text-sm text-blue-100">Industry-aligned curriculum</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Expert Mentors</div>
                      <div className="text-sm text-blue-100">Learn from top professionals</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-3 p-8">
                <CallbackForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            <FaqItem question="Can programs be customized?" answer="Yes, absolutely. We tailor the training duration, content depth, delivery mode, and project requirements to perfectly align with your institution's specific needs and academic calendar." />
            <FaqItem question="Do you provide offline training?" answer="Yes, we offer flexible delivery models including fully online, fully offline (at your campus), and hybrid models." />
            <FaqItem question="Can training be integrated into the academic curriculum?" answer="Yes, our Semester Long Training Programs are designed specifically to be integrated seamlessly with academic semesters, supplementing the standard curriculum." />
            <FaqItem question="Do students receive certificates?" answer="Yes, upon successful completion of the training and assessments, students receive industry-recognized certificates from SkillifyMe." />
            <FaqItem question="Do you provide placement assistance?" answer="Yes, our dedicated placement support includes career guidance, resume building, mock interviews, and access to our hiring network for successful graduates." />
          </div>
        </div>
      </section>
    </div>
  );
};

// Sub-components
const ServiceCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all group">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const FeatureCard = ({ title, description }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
    <div className="flex items-center gap-3 mb-4">
      <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    <p className="text-slate-400 text-sm leading-relaxed pl-9">{description}</p>
  </div>
);

const DomainCard = ({ icon, name }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center gap-3 cursor-pointer group">
    <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
      {React.cloneElement(icon, { className: 'w-8 h-8' })}
    </div>
    <span className="font-semibold text-slate-700 text-sm">{name}</span>
  </div>
);

const TimelineStep = ({ number, title, description, align }) => (
  <div className={`relative flex items-center justify-between md:justify-normal w-full group ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
    {/* Center Dot for Desktop */}
    <div className="hidden md:flex absolute left-1/2 -ml-5 w-10 h-10 rounded-full bg-white border-4 border-slate-200 items-center justify-center z-10 group-hover:border-blue-500 transition-colors">
      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
    </div>
    
    <div className={`w-full md:w-[45%] flex flex-col ${align === 'left' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} bg-white md:bg-transparent p-6 md:p-0 rounded-2xl shadow-sm md:shadow-none border border-slate-100 md:border-none`}>
      <span className="text-blue-600 font-bold text-lg mb-2">Step {number}</span>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  </div>
);

const TestimonialCard = ({ quote, author, role }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
    <div className="text-amber-400 flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
    </div>
    <p className="text-slate-700 italic mb-6 leading-relaxed">"{quote}"</p>
    <div>
      <div className="font-bold text-slate-900">{author}</div>
      <div className="text-sm text-slate-500">{role}</div>
    </div>
  </div>
);

const CallbackForm = () => {
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  // Enquiries are saved as contact messages so they show up in Admin → Contacts
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    const f = Object.fromEntries(new FormData(e.target));
    const message = [
      '[Institution enquiry]',
      `Institution: ${f.institution}`,
      `Designation: ${f.designation}`,
      `Phone: ${f.phone}`,
      `Number of students: ${f.students}`,
      '',
      f.details,
    ].join('\n');

    const { error } = await supabase
      .from('contacts')
      .insert([{ name: f.contact_person, email: f.email, message }]);
    setStatus(error ? 'error' : 'success');
  };

  if (status === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
        <p className="text-slate-600">Our academic partnership team will contact you within 24 hours.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-8 text-blue-600 font-semibold hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
          <input required type="text" name="institution" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
          <input required type="text" name="contact_person" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
          <input required type="text" name="designation" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input required type="email" name="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input required type="tel" name="phone" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Number of Students</label>
          <select required name="students" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white">
            <option value="">Select...</option>
            <option value="1-50">1 - 50</option>
            <option value="51-200">51 - 200</option>
            <option value="201-500">201 - 500</option>
            <option value="500+">500+</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Training Requirement Details</label>
        <textarea required name="details" rows="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"></textarea>
      </div>
      
      {status === 'error' && (
        <p className="text-sm text-red-600">Something went wrong. Please try again or email us directly.</p>
      )}

      <button 
        type="submit" 
        disabled={status === 'submitting'}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
      >
        {status === 'submitting' ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          'Request Callback'
        )}
      </button>
    </form>
  );
};

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
      >
        <span className="font-semibold text-slate-900">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-slate-600 border-t border-slate-100 pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstitutionTraining;
