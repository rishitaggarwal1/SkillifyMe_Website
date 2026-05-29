import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import {
  Mail, MapPin, Phone, Clock, Send, CheckCircle,
  Twitter, Linkedin, Instagram, Youtube, MessageSquare,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const DEFAULT_INFO = {
  email: 'contact@skillifyme.co.in',
  phone: '',
  address: '',
  city: '',
  country: 'India',
  working_hours: 'Mon–Sat, 9 AM – 7 PM IST',
  linkedin_url: '',
  twitter_url: '',
  instagram_url: '',
  youtube_url: '',
};

const Contact = () => {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    supabase
      .from('contact_info')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setInfo({ ...DEFAULT_INFO, ...data }); });
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{ name: formData.name, email: formData.email, message: formData.message }]);
      if (error) throw error;
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  const contactCards = [
    { icon: Mail, label: 'Email Us', value: info.email, href: `mailto:${info.email}`, color: 'bg-blue-50 text-blue-600' },
    ...(info.phone ? [{ icon: Phone, label: 'Call Us', value: info.phone, href: `tel:${info.phone}`, color: 'bg-indigo-50 text-indigo-600' }] : []),
    ...((info.address || info.city || info.country) ? [{
      icon: MapPin,
      label: 'Our Location',
      value: [info.address, info.city, info.country].filter(Boolean).join(', '),
      href: null,
      color: 'bg-purple-50 text-purple-600',
    }] : []),
    ...(info.working_hours ? [{ icon: Clock, label: 'Working Hours', value: info.working_hours, href: null, color: 'bg-pink-50 text-pink-600' }] : []),
  ];

  const socials = [
    { icon: Twitter, url: info.twitter_url, label: 'Twitter' },
    { icon: Linkedin, url: info.linkedin_url, label: 'LinkedIn' },
    { icon: Instagram, url: info.instagram_url, label: 'Instagram' },
    { icon: Youtube, url: info.youtube_url, label: 'YouTube' },
  ].filter((s) => s.url);

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white text-slate-900 placeholder-slate-400';

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Hero */}
      <section className="relative bg-white border-b border-slate-100 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl opacity-70" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-indigo-50 blur-3xl opacity-70" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-bold tracking-wider uppercase text-xs px-4 py-2 rounded-full mb-5">
              <MessageSquare className="w-4 h-4" />
              Get In Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              We'd love to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                hear from you
              </span>
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Have questions about our courses or internships? Reach out — our team usually responds within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${contactCards.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-' + contactCards.length} gap-5 mb-12`}>
            {contactCards.map((card, idx) => {
              const Icon = card.icon;
              const content = (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center group"
                >
                  <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className={`text-sm font-semibold text-slate-700 ${card.href ? 'group-hover:text-blue-600 transition-colors' : ''}`}>
                    {card.value}
                  </p>
                </motion.div>
              );
              return card.href ? (
                <a key={idx} href={card.href}>{content}</a>
              ) : (
                <div key={idx}>{content}</div>
              );
            })}
          </div>

          {/* Main Two-Column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Left — info + social */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-3">Contact Information</h2>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6">
                    Fill out the form and our team will get back to you within 24 hours. Or reach us directly through any of the channels below.
                  </p>
                  <ul className="space-y-4">
                    {info.email && (
                      <li className="flex items-center gap-3 text-sm">
                        <Mail className="w-5 h-5 text-blue-200 shrink-0" />
                        <a href={`mailto:${info.email}`} className="text-white hover:text-blue-100 transition-colors break-all">{info.email}</a>
                      </li>
                    )}
                    {info.phone && (
                      <li className="flex items-center gap-3 text-sm">
                        <Phone className="w-5 h-5 text-blue-200 shrink-0" />
                        <a href={`tel:${info.phone}`} className="text-white hover:text-blue-100 transition-colors">{info.phone}</a>
                      </li>
                    )}
                    {(info.address || info.city || info.country) && (
                      <li className="flex items-start gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                        <span className="text-blue-50">{[info.address, info.city, info.country].filter(Boolean).join(', ')}</span>
                      </li>
                    )}
                    {info.working_hours && (
                      <li className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-blue-200 shrink-0" />
                        <span className="text-blue-50">{info.working_hours}</span>
                      </li>
                    )}
                  </ul>

                  {socials.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/20">
                      <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">Follow Us</p>
                      <div className="flex gap-3">
                        {socials.map(({ icon: SIcon, url, label }) => (
                          <a
                            key={label}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                            title={label}
                          >
                            <SIcon className="w-4 h-4 text-white" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right — form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Send a Message</h2>
              <p className="text-slate-500 text-sm mb-7">We'll respond as soon as possible.</p>

              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Message sent! We'll get back to you soon.</p>
                </div>
              )}
              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange}
                    placeholder="John Doe" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange}
                    placeholder="john@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Message</label>
                  <textarea name="message" required rows={5} value={formData.message} onChange={handleChange}
                    placeholder="How can we help you?" className={inputCls + ' resize-none'} />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
