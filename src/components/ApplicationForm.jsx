import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { supabase, API_URL } from '../lib/supabaseClient';
import { loadRazorpay } from '../lib/razorpay';
import RollNumberCard from './RollNumberCard';
import { Loader2, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

// onProgramChange(course, programType) tells the page which course (or null) and type are selected,
// so it can show the course curriculum
export default function ApplicationForm({ onProgramChange }) {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('course');
  const [programType, setProgramType] = useState(initialCourseId ? 'course' : 'internship');
  const [internships, setInternships] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  // Set after a successful course purchase: { rollNumber, title, email }
  const [enrolled, setEnrolled] = useState(null);
  const [fileError, setFileError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  const isCourse = programType === 'course';
  const programs = isCourse ? courses : internships;
  const selectedProgramId = watch('program_id');
  const selectedProgram = programs.find(p => p.id === selectedProgramId);

  useEffect(() => {
    onProgramChange?.(isCourse ? selectedProgram || null : null, programType);
  }, [isCourse, selectedProgram, programType, onProgramChange]);

  useEffect(() => {
    const fetchPrograms = async () => {
      const [internshipsRes, coursesRes] = await Promise.all([
        supabase.from('internships').select('id, title, price, original_price'),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
      ]);
      if (!internshipsRes.error && internshipsRes.data) setInternships(internshipsRes.data);
      if (!coursesRes.error && coursesRes.data) setCourses(coursesRes.data);
    };
    fetchPrograms();
  }, []);

  // Preselect the course the user clicked "Enroll" on. This runs after the options are rendered,
  // otherwise the dropdown would look empty even though the course is selected.
  useEffect(() => {
    if (initialCourseId && courses.some(c => c.id === initialCourseId)) {
      setValue('program_id', initialCourseId);
    }
  }, [courses, initialCourseId, setValue]);

  const switchProgramType = (type) => {
    setProgramType(type);
    setValue('program_id', '');
  };

  const uploadResume = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const postCheckout = async (step, body) => {
    const res = await fetch(`${API_URL}/checkout/${step}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error?.message || 'Something went wrong. Please try again.');
    return json.data;
  };

  const handleApplyAndPay = async (formData) => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    setFileError('');

    try {
      const file = formData.resume?.[0];
      if (file && file.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed.');
        setLoading(false);
        return;
      }

      let resumeUrl = null;
      if (file) {
        resumeUrl = await uploadResume(file);
      }

      // 1. The server saves the student + application and creates the Razorpay order
      //    (the price is read from the database, not from this page)
      const checkout = await postCheckout('start', {
        program_type: programType,
        program_id: formData.program_id,
        student: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          degree: formData.degree,
          branch: formData.branch,
          passout_year: formData.passout_year,
          resume_url: resumeUrl,
        },
      });

      const programTitle = selectedProgram?.title;

      if (checkout.free) {
        if (checkout.roll_number) {
          setEnrolled({ rollNumber: checkout.roll_number, title: programTitle, email: formData.email });
          return;
        }
        setStatus({ type: 'success', message: 'Enrollment successful! Welcome aboard.' });
        reset();
        return;
      }

      // 2. Open Razorpay for the order the server created
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      const paymentObject = new window.Razorpay({
        key: checkout.key_id,
        order_id: checkout.order_id,
        amount: checkout.amount,
        currency: checkout.currency,
        name: 'SkillifyMe',
        description: `Enrollment for ${checkout.title}`,
        handler: async function (response) {
          // 3. The server checks Razorpay's signature before marking the enrollment paid
          try {
            const verified = await postCheckout('verify', response);
            if (verified.roll_number) {
              setEnrolled({ rollNumber: verified.roll_number, title: programTitle, email: formData.email });
              return;
            }
            setStatus({ type: 'success', message: 'Enrollment and payment successful! Welcome aboard.' });
            reset();
          } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Payment received, but we could not confirm it. Please contact support with your payment ID: ' + response.razorpay_payment_id });
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#4f46e5',
        },
      });

      paymentObject.on('payment.failed', async function (response) {
        await postCheckout('failed', {
          razorpay_order_id: checkout.order_id,
          razorpay_payment_id: response.error?.metadata?.payment_id,
        }).catch(console.error);
        setStatus({ type: 'error', message: 'Payment failed. Your application is saved as pending.' });
      });

      paymentObject.open();
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setEnrolled(null);
    setStatus({ type: '', message: '' });
    reset();
  };

  // Success screen after buying a course: shows the roll number
  if (enrolled) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">You're enrolled!</h2>
          {enrolled.title && <p className="text-slate-500 mt-1">Welcome to {enrolled.title}.</p>}
        </div>

        <RollNumberCard rollNumber={enrolled.rollNumber} />

        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900">
          <p className="font-semibold mb-1">Keep your roll number safe</p>
          <p className="text-blue-800">
            Use it with your email <span className="font-semibold">{enrolled.email}</span> to access your course
            on our learning platform. Note it down or take a screenshot of this page.
          </p>
        </div>

        <button
          type="button"
          onClick={startOver}
          className="mt-6 w-full py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Enroll in another course
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">{isCourse ? 'Course Enrollment' : 'Internship Application'}</h2>
        <p className="text-slate-500 text-sm mt-1">Fill in your details and complete the payment to enroll.</p>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleApplyAndPay)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
              })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
            <input
              {...register('phone', { required: 'Phone is required' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="+91 9876543210"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* College */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">College Name *</label>
            <input
              {...register('college', { required: 'College is required' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="e.g. IIT Bombay"
            />
            {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college.message}</p>}
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Degree *</label>
            <input
              {...register('degree', { required: 'Degree is required' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="e.g. B.Tech"
            />
            {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree.message}</p>}
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch/Specialization *</label>
            <input
              {...register('branch', { required: 'Branch is required' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="e.g. Computer Science"
            />
            {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch.message}</p>}
          </div>

          {/* Passout Year */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passout Year *</label>
            <input
              type="number"
              {...register('passout_year', { required: 'Passout year is required' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="2025"
            />
            {errors.passout_year && <p className="text-red-500 text-xs mt-1">{errors.passout_year.message}</p>}
          </div>

          {/* Program Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">I want to enroll in *</label>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              {[
                { id: 'course', label: 'Course' },
                { id: 'internship', label: 'Internship' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchProgramType(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    programType === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Program Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select {isCourse ? 'Course' : 'Internship'} *</label>
            <select
              {...register('program_id', { required: `Please select a${isCourse ? ' course' : 'n internship'}` })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
            >
              <option value="">-- Choose a{isCourse ? ' Course' : 'n Internship'} --</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.title} - ₹{program.price ?? 0}
                </option>
              ))}
            </select>
            {errors.program_id && <p className="text-red-500 text-xs mt-1">{errors.program_id.message}</p>}
          </div>

          {/* Resume Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Resume (PDF only){isCourse ? ' (optional)' : ' *'}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-blue-500 transition-colors bg-slate-50">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                <div className="flex text-sm text-slate-600 justify-center">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      {...register('resume', { required: isCourse ? false : 'Resume is required' })}
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500">PDF up to 5MB</p>
                {watch('resume') && watch('resume').length > 0 && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Selected: {watch('resume')[0].name}
                  </p>
                )}
              </div>
            </div>
            {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume.message}</p>}
            {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
          </div>
        </div>

        {/* Total Price Display */}
        {selectedProgram && (
          <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
            <div>
              <h3 className="text-blue-900 font-semibold text-lg">{selectedProgram.title}</h3>
              <p className="text-blue-700 text-sm">One-time payment</p>
            </div>
            <div className="text-right">
              {selectedProgram.original_price > selectedProgram.price && (
                <span className="text-blue-400 line-through text-sm mr-2">₹{selectedProgram.original_price}</span>
              )}
              <span className="text-2xl font-bold text-blue-900">₹{selectedProgram.price}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Apply & Pay ${selectedProgram ? '₹' + selectedProgram.price : ''}`
          )}
        </button>
      </form>
    </div>
  );
}
