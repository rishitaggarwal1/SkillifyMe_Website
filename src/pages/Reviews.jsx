import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Star, Quote, Play, X, MessageCircle, Video, Trophy } from 'lucide-react';
import Loader from '../components/Loader';

// ── YouTube helpers ──────────────────────────────────────────
const getYouTubeId = (url = '') => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^&\n?#]+)/);
  return m ? m[1] : null;
};

const ytThumb = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const ytEmbed = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
};

// ── Sub-components ───────────────────────────────────────────
const StarRow = ({ rating = 0, size = 'sm' }) => {
  const px = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${px} ${i <= rating ? 'fill-current' : 'opacity-25'}`} />
      ))}
    </div>
  );
};

const TextCard = ({ review, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, delay: (idx % 3) * 0.08 }}
    className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4 relative"
  >
    {review.is_featured && (
      <span className="absolute top-5 right-5 bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
        <Trophy className="w-3 h-3" /> Featured
      </span>
    )}
    <Quote className="w-8 h-8 text-blue-100 shrink-0" />
    <p className="text-slate-700 leading-relaxed text-[0.95rem] flex-grow">
      "{review.review_text}"
    </p>
    {review.rating > 0 && <StarRow rating={review.rating} />}
    <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
      <img
        src={review.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name)}&background=1d4ed8&color=fff`}
        alt={review.reviewer_name}
        className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shrink-0"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name)}&background=1d4ed8&color=fff`;
        }}
      />
      <div>
        <p className="font-bold text-slate-900 text-sm">{review.reviewer_name}</p>
        {review.reviewer_role && (
          <p className="text-xs text-slate-500">{review.reviewer_role}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const VideoCard = ({ review, idx, onPlay }) => {
  const thumb = review.video_thumbnail || ytThumb(review.video_url) || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (idx % 3) * 0.08 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex flex-col"
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-slate-200 overflow-hidden cursor-pointer"
        onClick={() => onPlay(review)}
      >
        {thumb ? (
          <img
            src={thumb}
            alt={review.video_title || review.reviewer_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
            <Video className="w-12 h-12 text-white/40" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/50 transition-colors duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
            <Play className="w-6 h-6 text-blue-600 fill-current ml-1" />
          </div>
        </div>
        {review.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-amber-400 text-amber-900 text-xs font-extrabold px-2.5 py-1 rounded">
              FEATURED
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2">
        {review.video_title && (
          <p className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
            {review.video_title}
          </p>
        )}
        {review.rating > 0 && <StarRow rating={review.rating} />}
        <div className="flex items-center gap-2.5 mt-1">
          <img
            src={review.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name)}&background=1d4ed8&color=fff`}
            alt={review.reviewer_name}
            className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name)}&background=1d4ed8&color=fff`;
            }}
          />
          <div>
            <p className="text-sm font-semibold text-slate-800">{review.reviewer_name}</p>
            {review.reviewer_role && (
              <p className="text-xs text-slate-500">{review.reviewer_role}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────
const TABS = [
  { id: 'all', label: 'All Reviews', icon: MessageCircle },
  { id: 'text', label: 'Text Reviews', icon: Quote },
  { id: 'video', label: 'Video Reviews', icon: Video },
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [videoModal, setVideoModal] = useState(null);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setReviews(data);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return reviews;
    return reviews.filter((r) => r.type === activeTab);
  }, [reviews, activeTab]);

  const textReviews = filtered.filter((r) => r.type === 'text');
  const videoReviews = filtered.filter((r) => r.type === 'video');

  const avgRating =
    reviews.filter((r) => r.rating > 0).length > 0
      ? (
          reviews.filter((r) => r.rating > 0).reduce((s, r) => s + r.rating, 0) /
          reviews.filter((r) => r.rating > 0).length
        ).toFixed(1)
      : null;

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative bg-slate-950 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-500 to-transparent blur-[120px]" />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-500 to-transparent blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 font-bold tracking-wider uppercase text-xs px-4 py-2 rounded-full mb-5 border border-blue-500/30">
              <Star className="w-3.5 h-3.5 fill-current" />
              Student Reviews
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight">
              Hear From Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Graduates
              </span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Real stories from students who transformed their careers with SkillifyMe.
            </p>

            {/* Aggregate stats */}
            {reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4"
              >
                {avgRating && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-white">{avgRating}</span>
                    <div className="flex flex-col items-start gap-1">
                      <StarRow rating={Math.round(avgRating)} size="lg" />
                      <span className="text-xs text-slate-400">Average Rating</span>
                    </div>
                  </div>
                )}
                {avgRating && <div className="w-px h-10 bg-white/20" />}
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{reviews.length}+</p>
                  <p className="text-xs text-slate-400">Reviews</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">
                    {reviews.filter((r) => r.type === 'video').length}
                  </p>
                  <p className="text-xs text-slate-400">Video Reviews</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="sticky top-[80px] z-30 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'all'
                ? reviews.length
                : reviews.filter((r) => r.type === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <MessageCircle className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No reviews in this category yet.</p>
            </div>
          ) : (
            <>
              {/* Text Reviews */}
              {textReviews.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <div className="flex items-center gap-3 mb-8">
                      <Quote className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-slate-800">Text Reviews</h2>
                      <span className="text-sm text-slate-400">({textReviews.length})</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {textReviews.map((r, idx) => (
                        <TextCard key={r.id} review={r} idx={idx} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Video Reviews */}
              {videoReviews.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <div className="flex items-center gap-3 mb-8">
                      <Video className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-slate-800">Video Reviews</h2>
                      <span className="text-sm text-slate-400">({videoReviews.length})</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {videoReviews.map((r, idx) => (
                        <VideoCard key={r.id} review={r} idx={idx} onPlay={setVideoModal} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Video Lightbox ── */}
      <AnimatePresence>
        {videoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-3xl rounded-2xl overflow-hidden bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video w-full">
                <iframe
                  src={ytEmbed(videoModal.video_url)}
                  title={videoModal.video_title || videoModal.reviewer_name}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-3">
                  <img
                    src={videoModal.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(videoModal.reviewer_name)}&background=1d4ed8&color=fff`}
                    alt={videoModal.reviewer_name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(videoModal.reviewer_name)}&background=1d4ed8&color=fff`; }}
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">{videoModal.reviewer_name}</p>
                    {videoModal.reviewer_role && (
                      <p className="text-slate-400 text-xs">{videoModal.reviewer_role}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setVideoModal(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
