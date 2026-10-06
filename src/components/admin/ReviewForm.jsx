import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Quote, Video, Star } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const DEFAULT = {
  type: 'text',
  reviewer_name: '',
  reviewer_role: '',
  reviewer_avatar: '',
  rating: 5,
  review_text: '',
  video_url: '',
  video_thumbnail: '',
  video_title: '',
  is_featured: false,
};

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i)}
        className="focus:outline-none"
      >
        <Star
          className={`w-6 h-6 transition-colors ${
            i <= value ? 'text-amber-400 fill-current' : 'text-slate-200'
          }`}
        />
      </button>
    ))}
  </div>
);

export default function ReviewForm({ initialData, onSubmit, onClose }) {
  const [form, setForm] = useState(DEFAULT);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({ ...DEFAULT, ...initialData });
      setAvatarPreview(initialData.reviewer_avatar || '');
    }
  }, [initialData]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setUploadError('');
  };

  const uploadAvatar = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `avatars/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('gallery').upload(path, file, { upsert: false });
    if (error) throw error;
    return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.type === 'text' && !form.review_text.trim()) {
      setUploadError('Review text is required for text reviews.');
      return;
    }
    if (form.type === 'video' && !form.video_url.trim()) {
      setUploadError('Video URL is required for video reviews.');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      let avatarUrl = form.reviewer_avatar;
      if (avatarFile) avatarUrl = await uploadAvatar(avatarFile);
      await onSubmit({ ...form, reviewer_avatar: avatarUrl });
    } catch {
      setUploadError('Avatar upload failed. Try again or use a URL.');
      setUploading(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Review' : 'Add Review'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Type selector */}
          <div>
            <label className={labelCls}>Review Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'text', label: 'Text Review', icon: Quote, desc: 'Written testimonial with star rating' },
                { id: 'video', label: 'Video Review', icon: Video, desc: 'YouTube or video URL with thumbnail' },
              ].map((t) => {
                const Icon = t.icon;
                const active = form.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.id })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-semibold">{t.label}</span>
                    <span className="text-xs leading-tight opacity-70">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Common: Name + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Reviewer Name *</label>
              <input type="text" name="reviewer_name" required value={form.reviewer_name}
                onChange={handle} placeholder="e.g. Priya Sharma" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Role / Company</label>
              <input type="text" name="reviewer_role" value={form.reviewer_role}
                onChange={handle} placeholder="e.g. SDE at Amazon" className={inputCls} />
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className={labelCls}>Reviewer Photo</label>
            <div className="flex items-center gap-4">
              {/* Preview circle */}
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <span className="text-slate-400 text-xs">Photo</span>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" id="avatar-upload" />
                <label htmlFor="avatar-upload"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 font-medium text-xs text-slate-700 transition-colors w-fit">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </label>
                <input type="url" name="reviewer_avatar" value={avatarFile ? '' : form.reviewer_avatar}
                  onChange={handle} disabled={!!avatarFile}
                  placeholder="Or paste photo URL"
                  className={inputCls + ' text-xs disabled:opacity-50 disabled:cursor-not-allowed'} />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className={labelCls}>Rating</label>
            <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_featured" name="is_featured" checked={form.is_featured}
              onChange={handle} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
            <label htmlFor="is_featured" className="text-sm font-medium text-slate-700 cursor-pointer">
              Mark as Featured (shown first)
            </label>
          </div>

          <hr className="border-slate-100" />

          {/* ── Text-specific ── */}
          {form.type === 'text' && (
            <div>
              <label className={labelCls}>Review Text *</label>
              <textarea name="review_text" rows={5} value={form.review_text} onChange={handle}
                placeholder="What the student said about their experience…"
                className={inputCls + ' resize-none'} />
            </div>
          )}

          {/* ── Video-specific ── */}
          {form.type === 'video' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Video URL * (YouTube or direct link)</label>
                <input type="url" name="video_url" value={form.video_url} onChange={handle}
                  placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                <p className="text-xs text-slate-400 mt-1">
                  YouTube thumbnails are generated automatically from the URL.
                </p>
              </div>
              <div>
                <label className={labelCls}>Video Title</label>
                <input type="text" name="video_title" value={form.video_title} onChange={handle}
                  placeholder="e.g. My SkillifyMe Journey" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Custom Thumbnail URL (optional)</label>
                <input type="url" name="video_thumbnail" value={form.video_thumbnail} onChange={handle}
                  placeholder="Override the auto-generated thumbnail" className={inputCls} />
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {uploadError}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={uploading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm transition-all disabled:opacity-75">
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? 'Update' : 'Add'} Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
