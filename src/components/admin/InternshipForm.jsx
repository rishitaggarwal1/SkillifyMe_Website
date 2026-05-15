import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function InternshipForm({ initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    original_price: '',
    image_url: '',
    features: [''],
    problem_statement_url: '',
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        features: initialData.features?.length > 0 ? initialData.features : [''],
        problem_statement_url: initialData.problem_statement_url || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });
  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are allowed.');
        setPdfFile(null);
        return;
      }
      setPdfFile(file);
      setUploadError('');
    }
  };

  const handleUploadPDF = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `problem_statements/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes') // using the public resumes bucket
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');

    try {
      let problemStatementUrl = formData.problem_statement_url;

      if (pdfFile) {
        problemStatementUrl = await handleUploadPDF(pdfFile);
      }

      const cleanData = {
        ...formData,
        features: formData.features.filter((f) => f.trim() !== ''),
        problem_statement_url: problemStatementUrl,
      };

      onSubmit(cleanData);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError('Failed to upload the PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Internship' : 'Add New Internship'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (e.g., 30+ days)</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Original Price (₹)</label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            {/* Problem Statement PDF Upload (Optional) */}
            <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Problem Statement (PDF) <span className="text-xs font-normal text-slate-500">(Optional - can add later)</span>
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Choose PDF File</span>
                </label>
                
                {pdfFile && (
                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    {pdfFile.name}
                  </span>
                )}
                
                {!pdfFile && formData.problem_statement_url && (
                  <a
                    href={formData.problem_statement_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline font-semibold flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    Current Problem Statement PDF
                  </a>
                )}
              </div>
              
              {uploadError && <p className="text-red-500 text-xs mt-2 font-medium">{uploadError}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="Enter a feature"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 mt-2"
              >
                + Add Feature
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
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
              <span>{initialData ? 'Update' : 'Save'} Internship</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
