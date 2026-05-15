import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';

export default function PaymentsAdmin() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_id,
        created_at,
        student:students(name, email),
        internship:internships(title)
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching payments:', error);
    else setPayments(data);
    setLoading(false);
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
    { header: 'Amount', render: (row) => `₹${row.amount}` },
    { header: 'Transaction ID', accessor: 'payment_id' },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${row.status === 'paid' ? 'bg-green-100 text-green-800' : 
            row.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Payments</h2>
        <p className="text-slate-500">Track all transaction records.</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <DataTable
          data={payments}
          columns={columns}
        />
      )}
    </div>
  );
}
