import React, { useEffect, useState } from 'react';
import { X, FileText, Mail, Phone, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { StatusBadge } from './StatusBadge';
import RollNumberCard from '../RollNumberCard';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const programName = (row) => row.course?.title || row.internship?.title || '—';
const programType = (row) => (row.course ? 'Course' : row.internship ? 'Internship' : '');

// Side panel with everything about one student: profile, resume, enrollments and payments.
export default function StudentDetails({ student, onClose }) {
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [appsRes, paysRes] = await Promise.all([
        supabase.from('applications').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
      ]);
      setApplications(appsRes.data || []);
      setPayments(paysRes.data || []);
      setLoading(false);
    };
    load();
  }, [student.id]);

  const fields = [
    ['College', student.college],
    ['Degree', student.degree],
    ['Branch', student.branch],
    ['Passout year', student.passout_year],
    ['Registered', formatDate(student.created_at)],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        className="w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-800 truncate">{student.name}</h2>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <a href={`mailto:${student.email}`} className="flex items-center gap-2 hover:text-blue-600">
                <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{student.email}</span>
              </a>
              {student.phone && (
                <a href={`tel:${student.phone}`} className="flex items-center gap-2 hover:text-blue-600">
                  <Phone className="w-4 h-4 shrink-0" /> {student.phone}
                </a>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" title="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Profile */}
          <section>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            {student.resume_url ? (
              <a
                href={student.resume_url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-4 h-4" /> Open resume (PDF)
              </a>
            ) : (
              <p className="mt-5 text-sm text-slate-400">No resume uploaded</p>
            )}
          </section>

          {loading ? (
            <div className="flex justify-center py-6 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {/* Enrollments */}
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Enrollments ({applications.length})
                </h3>
                {applications.length === 0 ? (
                  <p className="text-sm text-slate-400">None yet</p>
                ) : (
                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                    {applications.map((a) => (
                      <li key={a.id} className="p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">{programName(a)}</div>
                            <div className="text-xs text-slate-500">{programType(a)} · {formatDate(a.created_at)}</div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <StatusBadge status={a.status} />
                            <StatusBadge status={a.payment_status} />
                          </div>
                        </div>
                        {a.roll_number && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <RollNumberCard rollNumber={a.roll_number} compact />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Payments */}
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Payments ({payments.length})
                </h3>
                {payments.length === 0 ? (
                  <p className="text-sm text-slate-400">None yet</p>
                ) : (
                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                    {payments.map((p) => (
                      <li key={p.id} className="p-3 flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 truncate">
                            ₹{Number(p.amount).toLocaleString('en-IN')} · {programName(p)}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {formatDate(p.created_at)}{p.payment_id ? ` · ${p.payment_id}` : ''}
                          </div>
                        </div>
                        <StatusBadge status={p.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
