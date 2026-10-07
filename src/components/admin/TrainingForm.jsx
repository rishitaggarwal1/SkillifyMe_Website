import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus, Minus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CATEGORIES = ['Web Dev', 'AI / ML', 'Programming', 'Cloud', 'Data Science', 'DevOps'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// In the form each module keeps its lessons as text (one per line); saved as { title, lessons: [] }
const emptyModule = () => ({ title: '', lessonsText: '' });

// Suggested course code: first three letters/digits of the title, e.g. "DevOps" -> "DEV"
const suggestCode = (title) => title.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);

const DEFAULT_FORM = {
  title: '',
  code: '',
  category: 'Web Dev',
  description: '',
  price: '',
  original_price: '',
  duration: '',
  level: 'Beginner',
  instructor: '',
  image_url: '',
  rating: '',
  students_count: '',
  topics: [''],
  curriculum: [],
  is_bestseller: false,
  language: 'English',
};

export default function TrainingForm({ initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [codeEdited, setCodeEdited] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...DEFAULT_FORM,
        ...initialData,
        topics: initialData.topics?.length > 0 ? initialData.topics : [''],
        curriculum: (initialData.curriculum || []).map((m) => ({
          title: m.title || '',
          lessonsText: (m.lessons || []).join('\n'),
        })),
        is_bestseller: initialData.is_bestseller ?? false,
      });
      setPreview(initialData.image_url || '');
    }
  }, [initialData]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    const next = { ...formData, [name]: type === 'checkbox' ? checked : value };
    // While adding a course, keep the code in step with the title until it is edited by hand
    if (name === 'title' && !initialData && !codeEdited) next.code = suggestCode(value);
    if (name === 'code') next.code = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    setFormData(next);
  };

  const handleTopic = (idx, val) => {
    const t = [...formData.topics];
    t[idx] = val;
    setFormData({ ...formData, topics: t });
  };

  const addTopic = () => setFormData({ ...formData, topics: [...formData.topics, ''] });
  const removeTopic = (idx) =>
    setFormData({ ...formData, topics: formData.topics.filter((_, i) => i !== idx) });

  // — Curriculum modules —
  const setCurriculum = (curriculum) => setFormData({ ...formData, curriculum });
  const updateModule = (idx, field, value) =>
    setCurriculum(formData.curriculum.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  const addModule = () => setCurriculum([...formData.curriculum, emptyModule()]);
  const removeModule = (idx) => setCurriculum(formData.curriculum.filter((_, i) => i !== idx));
  const moveModule = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= formData.curriculum.length) return;
    const list = [...formData.curriculum];
    [list[idx], list[target]] = [list[target], list[idx]];
    setCurriculum(list);
  };

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setUploadError('');
  };

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `courses/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('gallery').upload(path, file, { upsert: false });
    if (error) throw error;
    return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    try {
      let imageUrl = formData.image_url;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const curriculum = formData.curriculum
        .map((m) => ({
          title: m.title.trim(),
          lessons: m.lessonsText.split('\n').map((l) => l.trim()).filter(Boolean),
        }))
        .filter((m) => m.title || m.lessons.length > 0);

      await onSubmit({
        ...formData,
        curriculum,
        image_url: imageUrl,
        price: formData.price ? Number(formData.price) : null,
        original_price: formData.original_price ? Number(formData.original_price) : null,
        rating: formData.rating ? Number(formData.rating) : null,
        students_count: formData.students_count ? Number(formData.students_count) : null,
        topics: formData.topics.filter((t) => t.trim() !== ''),
      });
    } catch (err) {
      setUploadError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Course' : 'Add Course'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title + Code */}
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handle}
                placeholder="e.g. Full Stack Web Development" className={inputCls} />
            </div>
            <div className="w-28">
              <label className={labelCls}>Course code *</label>
              <input type="text" name="code" required minLength={3} maxLength={3} pattern="[A-Z0-9]{3}"
                value={formData.code || ''} onChange={(e) => { setCodeEdited(true); handle(e); }}
                title="3 letters or digits, e.g. DEV" placeholder="DEV"
                className={inputCls + ' font-mono uppercase tracking-widest text-center'} />
            </div>
          </div>
          <p className="text-xs text-slate-500 -mt-3">
            The course code goes into each student's roll number, e.g. {String(new Date().getFullYear()).slice(2)}{formData.code || 'DEV'}000001.
            {initialData && ' Changing it only affects students who enroll after the change.'}
          </p>

          {/* Category + Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" value={formData.category} onChange={handle} className={inputCls + ' bg-white'}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Level</label>
              <select name="level" value={formData.level} onChange={handle} className={inputCls + ' bg-white'}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" rows={3} value={formData.description} onChange={handle}
              className={inputCls + ' resize-none'} placeholder="Brief course description…" />
          </div>

          {/* Price + Original Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (₹) *</label>
              <input type="number" name="price" required min="0" value={formData.price} onChange={handle} className={inputCls} placeholder="6499" />
            </div>
            <div>
              <label className={labelCls}>Original Price (₹)</label>
              <input type="number" name="original_price" min="0" value={formData.original_price} onChange={handle} className={inputCls} placeholder="7999" />
            </div>
          </div>

          {/* Duration + Instructor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handle} className={inputCls} placeholder="e.g. 48 hours" />
            </div>
            <div>
              <label className={labelCls}>Instructor</label>
              <input type="text" name="instructor" value={formData.instructor} onChange={handle} className={inputCls} placeholder="Instructor name" />
            </div>
          </div>

          {/* Rating + Students Count + Language */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Rating (0–5)</label>
              <input type="number" name="rating" min="0" max="5" step="0.1" value={formData.rating} onChange={handle} className={inputCls} placeholder="4.8" />
            </div>
            <div>
              <label className={labelCls}>Students Count</label>
              <input type="number" name="students_count" min="0" value={formData.students_count} onChange={handle} className={inputCls} placeholder="2100" />
            </div>
            <div>
              <label className={labelCls}>Language</label>
              <input type="text" name="language" value={formData.language} onChange={handle} className={inputCls} placeholder="English" />
            </div>
          </div>

          {/* Bestseller toggle */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_bestseller" name="is_bestseller" checked={formData.is_bestseller} onChange={handle}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
            <label htmlFor="is_bestseller" className="text-sm font-medium text-slate-700 cursor-pointer">
              Mark as Bestseller
            </label>
          </div>

          {/* Topics */}
          <div>
            <label className={labelCls}>Topics / What You'll Learn</label>
            <div className="space-y-2">
              {formData.topics.map((topic, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => handleTopic(idx, e.target.value)}
                    className={inputCls + ' flex-1'}
                    placeholder={`Topic ${idx + 1}`}
                  />
                  {formData.topics.length > 1 && (
                    <button type="button" onClick={() => removeTopic(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addTopic}
              className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>

          {/* Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls + ' mb-0'}>Curriculum</label>
              {formData.curriculum.length > 0 && (
                <span className="text-xs text-slate-400">
                  {formData.curriculum.length} module{formData.curriculum.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Shown to students on the checkout page. Add a module, then list its lessons one per line.
            </p>

            <div className="space-y-3">
              {formData.curriculum.map((mod, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => updateModule(idx, 'title', e.target.value)}
                      placeholder={`Module ${idx + 1} title, e.g. HTML & CSS Fundamentals`}
                      className={inputCls + ' flex-1 bg-white'}
                    />
                    <button type="button" onClick={() => moveModule(idx, -1)} disabled={idx === 0}
                      className="p-1.5 text-slate-500 hover:bg-white rounded-lg disabled:opacity-30" title="Move up">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveModule(idx, 1)} disabled={idx === formData.curriculum.length - 1}
                      className="p-1.5 text-slate-500 hover:bg-white rounded-lg disabled:opacity-30" title="Move down">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => removeModule(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Remove module">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={mod.lessonsText}
                    onChange={(e) => updateModule(idx, 'lessonsText', e.target.value)}
                    placeholder={'One lesson per line, e.g.\nIntroduction to HTML\nCSS Flexbox & Grid'}
                    className={inputCls + ' bg-white resize-y'}
                  />
                </div>
              ))}
            </div>

            <button type="button" onClick={addModule}
              className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700">
              <Plus className="w-4 h-4" /> Add Module
            </button>
          </div>

          {/* Image */}
          <div>
            <label className={labelCls}>Course Image</label>
            <div className="flex flex-col gap-3">
              <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" id="course-img" />
              <label htmlFor="course-img"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors w-fit">
                <Upload className="w-4 h-4 text-slate-500" />
                {imageFile ? imageFile.name : 'Upload Image'}
              </label>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <hr className="flex-1 border-slate-200" /> OR <hr className="flex-1 border-slate-200" />
              </div>

              <input type="url" name="image_url" value={imageFile ? '' : formData.image_url} onChange={handle}
                disabled={!!imageFile} placeholder="Paste image URL"
                className={inputCls + ' disabled:opacity-50 disabled:cursor-not-allowed'} />

              {preview && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-100">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                  <button type="button"
                    onClick={() => { setImageFile(null); setPreview(''); setFormData({ ...formData, image_url: '' }); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-slate-600 hover:text-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={uploading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm transition-all disabled:opacity-75">
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? 'Update' : 'Save'} Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
