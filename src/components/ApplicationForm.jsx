import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { loadRazorpay } from '../lib/razorpay';
import { Loader2, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

export default function ApplicationForm() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [fileError, setFileError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  const selectedInternshipId = watch('internship_id');
  const selectedInternship = internships.find(i => i.id === selectedInternshipId);

  useEffect(() => {
    const fetchInternships = async () => {
      const { data, error } = await supabase
        .from('internships')
        .select('id, title, price, original_price');
      if (!error && data) {
        setInternships(data);
      }
    };
    fetchInternships();
  }, []);

  const uploadResume = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleApplyAndPay = async (formData) => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    setFileError('');

    try {
      const file = formData.resume[0];
      if (file && file.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed.');
        setLoading(false);
        return;
      }

      let resumeUrl = null;
      if (file) {
        resumeUrl = await uploadResume(file);
      }

      // 1. UPSERT STUDENT (Use email and phone as unique conflict target)
      // First, check if student exists
      let studentId;
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', formData.email)
        .eq('phone', formData.phone)
        .single();

      if (existingStudent) {
        studentId = existingStudent.id;
        // Update details
        await supabase.from('students').update({
          name: formData.name,
          college: formData.college,
          degree: formData.degree,
          branch: formData.branch,
          passout_year: formData.passout_year,
          ...(resumeUrl && { resume_url: resumeUrl })
        }).eq('id', studentId);
      } else {
        // Insert new student
        const { data: newStudent, error: studentError } = await supabase
          .from('students')
          .insert([{
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            college: formData.college,
            degree: formData.degree,
            branch: formData.branch,
            passout_year: formData.passout_year,
            resume_url: resumeUrl
          }])
          .select()
          .single();
        if (studentError) throw studentError;
        studentId = newStudent.id;
      }

      // 2. CREATE APPLICATION (Status: applied, Payment: pending)
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert([{
          student_id: studentId,
          internship_id: formData.internship_id,
          status: 'applied',
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (appError) throw appError;

      // 3. INITIATE RAZORPAY (If there's a price)
      if (selectedInternship && selectedInternship.price > 0) {
        const res = await loadRazorpay();
        if (!res) {
          throw new Error('Razorpay SDK failed to load');
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // You'll need this in .env
          amount: selectedInternship.price * 100, // Amount in paise
          currency: 'INR',
          name: 'SkillifyMe',
          description: `Enrollment for ${selectedInternship.title}`,
          handler: async function (response) {
            try {
              // 4. ON SUCCESS: UPDATE DB
              await supabase.from('applications').update({
                status: 'enrolled',
                payment_status: 'paid'
              }).eq('id', application.id);

              await supabase.from('payments').insert([{
                student_id: studentId,
                internship_id: formData.internship_id,
                amount: selectedInternship.price,
                payment_id: response.razorpay_payment_id,
                status: 'paid'
              }]);

              setStatus({ type: 'success', message: 'Application and payment successful! Welcome aboard.' });
              reset();
            } catch (err) {
              console.error(err);
              setStatus({ type: 'error', message: 'Payment recorded, but failed to update status. Please contact support.' });
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
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', async function (response) {
          await supabase.from('payments').insert([{
            student_id: studentId,
            internship_id: formData.internship_id,
            amount: selectedInternship.price,
            payment_id: response.error.metadata.payment_id,
            status: 'failed'
          }]);
          setStatus({ type: 'error', message: 'Payment failed. Your application is saved as pending.' });
        });
        
        paymentObject.open();
      } else {
        // Free internship flow
        await supabase.from('applications').update({
          status: 'enrolled',
          payment_status: 'paid'
        }).eq('id', application.id);
        
        setStatus({ type: 'success', message: 'Application submitted successfully!' });
        reset();
      }

    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Internship Application</h2>
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

          {/* Internship Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Internship *</label>
            <select
              {...register('internship_id', { required: 'Please select an internship' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
            >
              <option value="">-- Choose an Internship --</option>
              {internships.map(internship => (
                <option key={internship.id} value={internship.id}>
                  {internship.title} - ₹{internship.price}
                </option>
              ))}
            </select>
            {errors.internship_id && <p className="text-red-500 text-xs mt-1">{errors.internship_id.message}</p>}
          </div>

          {/* Resume Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Resume (PDF only) *</label>
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
                      {...register('resume', { required: 'Resume is required' })}
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
        {selectedInternship && (
          <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
            <div>
              <h3 className="text-blue-900 font-semibold text-lg">{selectedInternship.title}</h3>
              <p className="text-blue-700 text-sm">One-time payment</p>
            </div>
            <div className="text-right">
              {selectedInternship.original_price > selectedInternship.price && (
                <span className="text-blue-400 line-through text-sm mr-2">₹{selectedInternship.original_price}</span>
              )}
              <span className="text-2xl font-bold text-blue-900">₹{selectedInternship.price}</span>
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
            `Apply & Pay ${selectedInternship ? '₹' + selectedInternship.price : ''}`
          )}
        </button>
      </form>
    </div>
  );
}
