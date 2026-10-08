import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, QrCode,
  User, BookOpen, Hash, Clock, CalendarDays, Mail, Building2, Info,
} from 'lucide-react';
import { API_URL } from '../lib/supabaseClient';

// Accepts "26DEV000001", "studentid=26DEV000001" or ?studentid=26DEV000001
const readRollNumber = (param, searchParams) => {
  const raw = param || searchParams.get('studentid') || searchParams.get('roll') || '';
  return decodeURIComponent(raw).replace(/^studentid=/i, '').trim().toUpperCase();
};

// The fields come from the certificate_details view in the database (server/schema.sql), in its order.
// Known fields get a friendlier label and icon; any new column is shown automatically.
const KNOWN_FIELDS = {
  student_name: { label: 'Student name', icon: User },
  course_title: { label: 'Course / Training', icon: BookOpen },
  roll_number: { label: 'Roll number', icon: Hash, mono: true },
  institution: { label: 'Institution', icon: Building2 },
  institution_name: { label: 'Institution', icon: Building2 },
  college: { label: 'Institution', icon: Building2 },
  course_duration: { label: 'Duration', icon: Clock },
  enrolled_on: { label: 'Enrolled', icon: CalendarDays },
};

// "institution_name" -> "Institution name"
const labelFromColumn = (key) => {
  const words = key.replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.filter((v) => v !== null && v !== '').join(', ');
  if (typeof value === 'object') return '';
  const text = String(value);
  if (ISO_DATE.test(text) && !isNaN(new Date(text))) {
    // Enrolment month is enough; other dates show the full day
    const options = key === 'enrolled_on' ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(text).toLocaleDateString('en-IN', options);
  }
  return text;
};

const detailRows = (details) =>
  Object.entries(details || {})
    .map(([key, value]) => {
      const known = KNOWN_FIELDS[key] || {};
      return {
        key,
        label: known.label || labelFromColumn(key),
        icon: known.icon || Info,
        mono: known.mono || false,
        value: formatValue(key, value),
      };
    })
    .filter((row) => row.value);

const nowLabel = () =>
  new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const ValidateCertificate = () => {
  const { certId } = useParams();
  const [searchParams] = useSearchParams();
  const rollNumber = readRollNumber(certId, searchParams);

  // idle (no roll number yet) | loading | valid | invalid | error
  const [state, setState] = useState(rollNumber ? 'loading' : 'idle');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [checkedAt, setCheckedAt] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!rollNumber) {
      setState('idle');
      return;
    }
    let cancelled = false;
    setState('loading');
    fetch(`${API_URL}/certificates/${encodeURIComponent(rollNumber)}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error?.message || 'Could not check this certificate right now.');
        return json.data;
      })
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setCheckedAt(nowLabel());
        setState(data.valid ? 'valid' : 'invalid');
      })
      .catch((err) => {
        if (cancelled) return;
        setMessage(err.message);
        setState('error');
      });
    return () => { cancelled = true; };
  }, [rollNumber, attempt]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <section className="relative bg-slate-950 pt-12 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-blue-500 to-transparent blur-[120px]" />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500 to-transparent blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 text-blue-300 text-sm font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" /> Certificate Verification
          </span>
        </div>
      </section>

      <div className="relative z-10 max-w-2xl mx-auto px-4 -mt-24 pb-20 space-y-6">
        {/* Result card */}
        <motion.div
            key={`${rollNumber}-${state}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
          >
            {state === 'idle' && (
              <div className="p-12 flex flex-col items-center text-center text-slate-500">
                <QrCode className="w-12 h-12 text-blue-600 mb-4" />
                <p className="font-medium text-slate-700">Scan the QR code on a SkillifyMe certificate to verify it.</p>
              </div>
            )}

            {state === 'loading' && (
              <div className="p-12 flex flex-col items-center text-center text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="font-medium">Checking certificate {rollNumber}…</p>
              </div>
            )}

            {state === 'valid' && result && (
              <>
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 sm:px-10 py-8 text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">Certificate Verified</h2>
                  <p className="text-green-50 mt-1">This certificate is genuine and was issued by SkillifyMe.</p>
                </div>

                <div className="px-6 sm:px-10 py-8">
                  <p className="text-center text-lg text-slate-700 leading-relaxed mb-8">
                    <span className="font-bold text-slate-900">{result.details?.student_name || 'This student'}</span> has successfully
                    completed the <span className="font-bold text-slate-900">{result.details?.course_title || 'SkillifyMe'}</span> training.
                  </p>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detailRows(result.details)
                      .map(({ key, icon: Icon, label, value, mono }) => (
                        <div key={key} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</dt>
                            <dd className={`text-slate-900 font-semibold break-words ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</dd>
                          </div>
                        </div>
                      ))}
                  </dl>
                </div>

                <div className="px-6 sm:px-10 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> Official SkillifyMe record
                  </span>
                  <span>Verified on {checkedAt}</span>
                </div>
              </>
            )}

            {state === 'invalid' && (
              <div className="px-6 sm:px-10 py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Certificate Not Found</h2>
                <p className="text-slate-600 mt-3 max-w-md mx-auto leading-relaxed">
                  We couldn't find a completed SkillifyMe training for roll number{' '}
                  <span className="font-mono font-semibold text-slate-900 break-all">{result?.roll_number || rollNumber}</span>.
                  Please check the number printed on the certificate.
                </p>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Mail className="w-4 h-4" /> Contact SkillifyMe
                </Link>
              </div>
            )}

            {state === 'error' && (
              <div className="px-6 sm:px-10 py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="w-11 h-11 text-amber-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Couldn't check right now</h2>
                <p className="text-slate-600 mt-3">{message}</p>
                <button
                  onClick={() => setAttempt((n) => n + 1)}
                  className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}
          </motion.div>
      </div>
    </div>
  );
};

export default ValidateCertificate;
