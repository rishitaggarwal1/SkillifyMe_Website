import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';
import { useToast } from '../../components/admin/Toast';
import InternshipForm from '../../components/admin/InternshipForm';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function InternshipsAdmin() {
  const toast = useToast();
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

    if (error) toast.error(`Could not load data: ${error.message}`);
    else setInternships(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    const { error } = await supabase.from('internships').delete().eq('id', id);
    if (error) {
      toast.error(`Could not delete: ${error.message}`);
      return;
    }
    toast.success('Internship deleted');
    fetchInternships();
  };

  const handleSave = async (formData) => {
    const { error } = currentInternship
      ? await supabase.from('internships').update(formData).eq('id', currentInternship.id)
      : await supabase.from('internships').insert([formData]);
    if (error) {
      toast.error(`Could not save: ${error.message}`);
      return; // keep the form open so nothing typed is lost
    }
    toast.success(currentInternship ? 'Internship updated' : 'Internship added');
    setIsModalOpen(false);
    fetchInternships();
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Duration', accessor: 'duration' },
    { header: 'Price', value: (row) => Number(row.price || 0), render: (row) => `₹${row.price || 0}` },
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
          exportFileName="internships"
          searchPlaceholder="Search internships…"
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
