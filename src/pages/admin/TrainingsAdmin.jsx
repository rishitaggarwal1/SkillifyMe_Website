import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';
import TrainingForm from '../../components/admin/TrainingForm';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';

export default function TrainingsAdmin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching courses:', error);
    else setCourses(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this training program?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) console.error('Error deleting:', error);
    else fetchCourses();
  };

  const handleSave = async (formData) => {
    if (currentCourse) {
      const { error } = await supabase.from('courses').update(formData).eq('id', currentCourse.id);
      if (error) console.error('Error updating:', error);
    } else {
      const { error } = await supabase.from('courses').insert([formData]);
      if (error) console.error('Error inserting:', error);
    }
    setIsModalOpen(false);
    fetchCourses();
  };

  const LEVEL_COLORS = {
    Beginner: 'bg-green-50 text-green-700',
    Intermediate: 'bg-blue-50 text-blue-700',
    Advanced: 'bg-purple-50 text-purple-700',
  };

  const columns = [
    {
      header: 'Image',
      render: (row) =>
        row.image_url ? (
          <img src={row.image_url} alt={row.title}
            className="w-16 h-11 object-cover rounded-lg border border-slate-100"
            onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="w-16 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
            No img
          </div>
        ),
    },
    { header: 'Title', accessor: 'title' },
    {
      header: 'Category',
      render: (row) => (
        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {row.category || '—'}
        </span>
      ),
    },
    {
      header: 'Level',
      render: (row) => (
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLORS[row.level] || 'bg-slate-100 text-slate-600'}`}>
          {row.level || '—'}
        </span>
      ),
    },
    {
      header: 'Rating',
      render: (row) =>
        row.rating ? (
          <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
            <Star className="w-3.5 h-3.5 fill-current" />
            {row.rating}
          </span>
        ) : '—',
    },
    {
      header: 'Students',
      render: (row) =>
        row.students_count ? (row.students_count).toLocaleString('en-IN') : '—',
    },
    {
      header: 'Price',
      render: (row) => `₹${Number(row.price || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Bestseller',
      render: (row) =>
        row.is_bestseller ? (
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">Yes</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-3">
      <button
        onClick={() => { setCurrentCourse(row); setIsModalOpen(true); }}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Training Programs</h2>
          <p className="text-slate-500">Manage courses shown on the public Trainings page.</p>
        </div>
        <button
          onClick={() => { setCurrentCourse(null); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Program
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading programs…</div>
      ) : (
        <DataTable data={courses} columns={columns} renderActions={renderActions} />
      )}

      {isModalOpen && (
        <TrainingForm
          initialData={currentCourse}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}