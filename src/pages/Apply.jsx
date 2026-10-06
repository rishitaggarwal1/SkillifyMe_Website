import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import CourseCurriculum from '../components/CourseCurriculum';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Apply() {
  const [searchParams] = useSearchParams();
  // The course currently picked in the form; its curriculum is shown on the left
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [programType, setProgramType] = useState(searchParams.get('course') ? 'course' : 'internship');
  const isCourse = programType === 'course';

  const handleProgramChange = useCallback((course, type) => {
    setSelectedCourse(course);
    setProgramType(type);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left Column - Course curriculum, or general copy */}
        {selectedCourse ? (
          <motion.div
            key={selectedCourse.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 lg:sticky lg:top-[100px] self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2"
          >
            <CourseCurriculum course={selectedCourse} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6 w-max">
              <Sparkles className="w-4 h-4" />
              <span>Fast-track your career</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              {isCourse ? 'Enroll in your ' : 'Apply for your '}<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{isCourse ? 'Next Course' : 'Dream Internship'}</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Join thousands of students who have accelerated their tech careers with SkillifyMe's industry-recognized internship programs.
            </p>

            <div className="space-y-6">
              {[
                "1-on-1 Mentorship from Industry Experts",
                "Real-world Projects & Case Studies",
                "Guaranteed Letter of Recommendation",
                "100% Placement Assistance"
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <span className="text-slate-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-4">
              <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900">Secure Payment</h4>
                <p className="text-sm text-blue-700 mt-1">Your payment is processed securely via Razorpay. Bank-grade 256-bit encryption applied.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Right Column - Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7"
        >
          <ApplicationForm onProgramChange={handleProgramChange} />
        </motion.div>

      </div>
    </div>
  );
}
