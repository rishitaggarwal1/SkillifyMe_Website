import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';

export default function ApplicationsAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    // Join applications with students and internships
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        payment_status,
        created_at,
        student:students(name, email),
        internship:internships(title)
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching applications:', error);
    else setApplications(data);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (error) console.error('Error updating status:', error);
    else fetchApplications();
  };

  const columns = [
    { 
      header: 'Student', 
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.student?.name}</div>
          <div className="text-slate-500 text-xs">{row.student?.email}</div>
        </div>
      ) 
    },
    { header: 'Internship', render: (row) => row.internship?.title },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${row.status === 'enrolled' ? 'bg-green-100 text-green-800' : 
            row.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    { 
      header: 'Payment', 
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${row.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
          {row.payment_status.charAt(0).toUpperCase() + row.payment_status.slice(1)}
        </span>
      )
    },
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-2">
      {row.status !== 'enrolled' && (
        <button
          onClick={() => updateStatus(row.id, 'enrolled')}
          className="text-xs font-medium text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
        >
          Enroll
        </button>
      )}
      {row.status !== 'rejected' && (
        <button
          onClick={() => updateStatus(row.id, 'rejected')}
          className="text-xs font-medium text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
        >
          Reject
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Applications</h2>
        <p className="text-slate-500">Review and manage student applications.</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <DataTable
          data={applications}
          columns={columns}
          renderActions={renderActions}
        />
      )}
    </div>
  );
}
