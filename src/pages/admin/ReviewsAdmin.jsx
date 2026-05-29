import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';
import ReviewForm from '../../components/admin/ReviewForm';
import { Plus, Edit2, Trash2, Star, Quote, Video } from 'lucide-react';

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching reviews:', error);
    else setReviews(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) console.error('Error deleting:', error);
    else fetchReviews();
  };

  const handleSave = async (formData) => {
    if (current) {
      const { error } = await supabase.from('reviews').update(formData).eq('id', current.id);
      if (error) console.error('Error updating:', error);
    } else {
      const { error } = await supabase.from('reviews').insert([formData]);
      if (error) console.error('Error inserting:', error);
    }
    setIsModalOpen(false);
    fetchReviews();
  };

  const displayed = filterType === 'all' ? reviews : reviews.filter((r) => r.type === filterType);

  const columns = [
    {
      header: 'Reviewer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.reviewer_name)}&background=1d4ed8&color=fff&size=64`}
            alt={row.reviewer_name}
            className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.reviewer_name)}&background=1d4ed8&color=fff&size=64`;
            }}
          />
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.reviewer_name}</p>
            {row.reviewer_role && (
              <p className="text-xs text-slate-500">{row.reviewer_role}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      render: (row) =>
        row.type === 'text' ? (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Quote className="w-3 h-3" /> Text
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Video className="w-3 h-3" /> Video
          </span>
        ),
    },
    {
      header: 'Rating',
      render: (row) =>
        row.rating ? (
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-sm font-bold text-slate-700">{row.rating}</span>
          </div>
        ) : '—',
    },
    {
      header: 'Content',
      render: (row) =>
        row.type === 'text' ? (
          <span className="text-xs text-slate-500 block max-w-xs truncate" title={row.review_text}>
            {row.review_text}
          </span>
        ) : (
          <span className="text-xs text-slate-500 block max-w-xs truncate" title={row.video_url}>
            {row.video_title || row.video_url || '—'}
          </span>
        ),
    },
    {
      header: 'Featured',
      render: (row) =>
        row.is_featured ? (
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">
            Yes
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: 'Added',
      render: (row) =>
        new Date(row.created_at).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
    },
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-3">
      <button
        onClick={() => { setCurrent(row); setIsModalOpen(true); }}
        className="text-blue-600 hover:text-blue-900 transition-colors"
        title="Edit"
      >
        <Edit2 className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="text-red-600 hover:text-red-900 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reviews</h2>
          <p className="text-slate-500">Manage text and video reviews shown on the public Reviews page.</p>
        </div>
        <button
          onClick={() => { setCurrent(null); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Review
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All', count: reviews.length },
          { id: 'text', label: 'Text', count: reviews.filter((r) => r.type === 'text').length },
          { id: 'video', label: 'Video', count: reviews.filter((r) => r.type === 'video').length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterType === f.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filterType === f.id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading reviews…</div>
      ) : (
        <DataTable data={displayed} columns={columns} renderActions={renderActions} />
      )}

      {isModalOpen && (
        <ReviewForm
          initialData={current}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
