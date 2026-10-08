import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CATEGORIES = ['Workshops', 'Projects', 'Internships', 'Certificates'];

export default function GalleryForm({ initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState({ title: '', category: 'Workshops', image_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Workshops',
        image_url: initialData.image_url || '',
      });
      setPreview(initialData.image_url || '');
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG, WEBP, or GIF images are allowed.');
      return;
    }
    setUploadError('');
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('gallery').upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('gallery').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image_url && !imageFile) {
      setUploadError('Please provide an image file or URL.');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      let imageUrl = formData.image_url;
      if (imageFile) imageUrl = await uploadImage(imageFile);
      await onSubmit({ ...formData, image_url: imageUrl });
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Gallery Item' : 'Add Gallery Item'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Full Stack Workshop Session"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
            <div className="flex flex-col gap-3">
              {/* Upload button */}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="gallery-img-upload" />
              <label
                htmlFor="gallery-img-upload"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors w-fit"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                {imageFile ? imageFile.name : 'Upload Image'}
              </label>

              {/* OR divider */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <hr className="flex-1 border-slate-200" /> OR <hr className="flex-1 border-slate-200" />
              </div>

              {/* URL fallback */}
              <input
                type="url"
                name="image_url"
                value={imageFile ? '' : formData.image_url}
                onChange={handleChange}
                disabled={!!imageFile}
                placeholder="Paste an image URL"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}

            {/* Preview */}
            {preview && (
              <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setPreview(''); setFormData({ ...formData, image_url: '' }); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-slate-600 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!preview && (
              <div className="mt-3 w-full h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Image className="w-8 h-8" />
                <span className="text-sm">Image preview will appear here</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm transition-all disabled:opacity-75"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? 'Update' : 'Save'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
