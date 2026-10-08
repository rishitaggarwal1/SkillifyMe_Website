import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Clock, ChevronRight, Users } from 'lucide-react';

const StarRating = ({ rating = 0 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= full ? 'fill-current' : i === full + 1 && half ? 'fill-current opacity-50' : ''}`}
        />
      ))}
    </div>
  );
};

const LEVEL_COLORS = {
  Beginner: 'bg-green-50 text-green-700',
  Intermediate: 'bg-blue-50 text-blue-700',
  Advanced: 'bg-purple-50 text-purple-700',
};

const CourseCard = ({ course }) => {
  const discount = course.original_price && course.price
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden group flex flex-col h-full transition-shadow duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100 flex-shrink-0">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-400 text-sm font-medium">
            No Preview
          </div>
        )}

        {/* Quick-peek overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-xs leading-relaxed line-clamp-4">{course.description}</p>
        </div>

        {/* Bestseller badge */}
        {course.is_bestseller && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-amber-400 text-amber-900 text-xs font-extrabold px-2.5 py-1 rounded tracking-wide">
              BESTSELLER
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category */}
        <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
          {course.category || 'General'}
        </span>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-slate-500 mb-3">
          by {course.instructor || 'SkillifyMe Team'}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-bold text-amber-600">{course.rating || '4.5'}</span>
          <StarRating rating={parseFloat(course.rating || 4.5)} />
          <span className="text-xs text-slate-400">
            ({(course.students_count || 0).toLocaleString()} students)
          </span>
        </div>

        {/* Duration + Level */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {course.duration || 'Flexible'}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || LEVEL_COLORS.Beginner}`}>
            {course.level || 'Beginner'}
          </span>
          {course.language && course.language !== 'English' && (
            <span className="text-xs text-slate-400">{course.language}</span>
          )}
        </div>

        {/* Topics */}
        {course.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.topics.slice(0, 3).map((t, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
            {course.topics.length > 3 && (
              <span className="text-xs text-slate-400 self-center">
                +{course.topics.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{Number(course.price || 0).toLocaleString('en-IN')}
            </span>
            {course.original_price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{Number(course.original_price).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <Link
            to={`/apply?course=${course.id}`}
            className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-600/20 flex-shrink-0"
          >
            Enroll
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;