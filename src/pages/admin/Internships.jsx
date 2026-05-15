import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';
import InternshipForm from '../../components/admin/InternshipForm';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function InternshipsAdmin() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInternship, setCurrentInternship] = useState(null);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching internships:', error);
    else setInternships(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    
    const { error } = await supabase.from('internships').delete().eq('id', id);
    if (error) console.error('Error deleting internship:', error);
    else fetchInternships();
  };

  const handleSave = async (formData) => {
    if (currentInternship) {
      // Update
      const { error } = await supabase
        .from('internships')
        .update(formData)
        .eq('id', currentInternship.id);
      if (error) console.error('Error updating:', error);
    } else {
      // Insert
      const { error } = await supabase
        .from('internships')
        .insert([formData]);
      if (error) console.error('Error inserting:', error);
    }
    
    setIsModalOpen(false);
    fetchInternships();
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Duration', accessor: 'duration' },
    { header: 'Price', render: (row) => `₹${row.price || 0}` },
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-3">
      <button
        onClick={() => {
          setCurrentInternship(row);
          setIsModalOpen(true);
        }}
        className="text-blue-600 hover:text-blue-900 transition-colors"
      >
        <Edit2 className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="text-red-600 hover:text-red-900 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Internships</h2>
          <p className="text-slate-500">Manage your internship programs.</p>
        </div>
        <button
          onClick={() => {
            setCurrentInternship(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Internship
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <DataTable
          data={internships}
          columns={columns}
          renderActions={renderActions}
        />
      )}

      {isModalOpen && (
        <InternshipForm
          initialData={currentInternship}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
