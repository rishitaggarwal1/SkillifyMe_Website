import { useEffect, useState } from 'react';
import { ChevronDown, Clock, BarChart3, User, Globe, PlayCircle, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';

// Left-hand panel on the checkout page: what the selected course covers.
const CourseCurriculum = ({ course }) => {
  const modules = (course.curriculum || []).filter((m) => m.title || m.lessons?.length);
  const lessonCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const [openIndex, setOpenIndex] = useState(0);

  // Open the first module again whenever the student picks a different course
  useEffect(() => setOpenIndex(0), [course.id]);

  const meta = [
    { icon: Clock, value: course.duration },
    { icon: BarChart3, value: course.level },
    { icon: User, value: course.instructor },
    { icon: Globe, value: course.language },
  ].filter((m) => m.value);

  return (
    <div className="space-y-6">
      {/* Course header */}
      <div>
        <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <BookOpen className="w-3.5 h-3.5" /> Course curriculum
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">{course.title}</h1>
        {course.description && <p className="text-slate-600 leading-relaxed mb-4">{course.description}</p>}
        {meta.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            {meta.map(({ icon: Icon, value }, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-blue-600" /> {value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modules */}
      {modules.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-3">
            {modules.length} module{modules.length === 1 ? '' : 's'} · {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {modules.map((mod, idx) => {
              const open = openIndex === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? -1 : idx)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                    aria-expanded={open}
                  >
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-slate-900">{mod.title || `Module ${idx + 1}`}</span>
                      <span className="block text-xs text-slate-500">
                        {mod.lessons?.length || 0} lesson{mod.lessons?.length === 1 ? '' : 's'}
                      </span>
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && mod.lessons?.length > 0 && (
                    <ul className="px-5 pb-4 pl-16 space-y-2">
                      {mod.lessons.map((lesson, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <PlayCircle className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : course.topics?.length > 0 ? (
        // No curriculum yet: fall back to the course's topics
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="font-semibold text-slate-900 mb-3">What you'll learn</p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {course.topics.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-500" /> {t}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-slate-500">The detailed curriculum for this course will be shared after enrollment.</p>
      )}

      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-900">Secure Payment</h4>
          <p className="text-sm text-blue-700 mt-1">Your payment is processed securely via Razorpay.</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCurriculum;
