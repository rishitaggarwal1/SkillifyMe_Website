import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';
import { useToast } from '../../components/admin/Toast';
import GalleryForm from '../../components/admin/GalleryForm';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function GalleryAdmin() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(`Could not load data: ${error.message}`);
    else setItems(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return;
    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    if (error) {
      toast.error(`Could not delete: ${error.message}`);
      return;
    }
    toast.success('Image deleted');
    fetchItems();
  };

  const handleSave = async (formData) => {
    const { error } = currentItem
      ? await supabase.from('gallery_items').update(formData).eq('id', currentItem.id)
      : await supabase.from('gallery_items').insert([formData]);
    if (error) {
      toast.error(`Could not save: ${error.message}`);
      return; // keep the form open so nothing typed is lost
    }
    toast.success(currentItem ? 'Image updated' : 'Image added');
    setIsModalOpen(false);
    fetchItems();
  };

  const columns = [
    {
      header: 'Image',
      render: (row) =>
        row.image_url ? (
          <img
            src={row.image_url}
            alt={row.title}
            className="w-16 h-12 object-cover rounded-lg border border-slate-100"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
            No img
          </div>
        ),
    },
    { header: 'Title', accessor: 'title' },
    {
      header: 'Category',
      value: (row) => row.category,
      render: (row) => (
        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Added On',
      value: (row) => row.created_at?.slice(0, 10),
      render: (row) =>
        new Date(row.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
    },
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-3">
      <button
        onClick={() => { setCurrentItem(row); setIsModalOpen(true); }}
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
          <h2 className="text-2xl font-bold text-slate-800">Gallery</h2>
          <p className="text-slate-500">Manage images shown on the public gallery page.</p>
        </div>
        <button
          onClick={() => { setCurrentItem(null); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Image
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading gallery items...</div>
      ) : (
        <DataTable
          data={items}
          columns={columns}
          renderActions={renderActions}
          exportFileName="gallery"
          searchPlaceholder="Search gallery…"
        />
      )}

      {isModalOpen && (
        <GalleryForm
          initialData={currentItem}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
