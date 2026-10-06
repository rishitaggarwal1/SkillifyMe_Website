import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable, { FilterPills } from '../../components/admin/DataTable';
import StudentDetails from '../../components/admin/StudentDetails';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useToast } from '../../components/admin/Toast';

const STATUSES = ['paid', 'pending', 'failed'];
const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function PaymentsAdmin() {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    // The server attaches the related student, internship and course to each row
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error(`Could not load payments: ${error.message}`);
    else setPayments(data);
    setLoading(false);
  };

  const displayed = statusFilter === 'all' ? payments : payments.filter((p) => p.status === statusFilter);

  const paid = payments.filter((p) => p.status === 'paid');
  const now = new Date();
  const paidThisMonth = paid.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const sum = (rows) => rows.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const summary = [
    { label: 'Total revenue', value: rupees(sum(paid)), sub: `${paid.length} paid` },
    { label: 'This month', value: rupees(sum(paidThisMonth)), sub: `${paidThisMonth.length} paid` },
    { label: 'Pending / failed', value: payments.length - paid.length, sub: 'not completed' },
  ];

  const columns = [
    {
      header: 'Student',
      value: (row) => row.student?.name,
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); if (row.student) setSelectedStudent(row.student); }}
          className="text-left group"
          title="View student details"
        >
          <div className="font-medium text-slate-900 group-hover:text-blue-600">{row.student?.name || '—'}</div>
          <div className="text-slate-500 text-xs">{row.student?.email}</div>
        </button>
      ),
    },
    { header: 'Email', value: (row) => row.student?.email, hidden: true },
    {
      header: 'Program',
      value: (row) => row.course?.title || row.internship?.title,
      render: (row) => (
        <div>
          <div>{row.course?.title || row.internship?.title || '—'}</div>
          <div className="text-slate-500 text-xs">{row.course ? 'Course' : row.internship ? 'Internship' : ''}</div>
        </div>
      ),
    },
    { header: 'Amount', value: (row) => Number(row.amount), render: (row) => rupees(row.amount) },
    { header: 'Transaction ID', accessor: 'payment_id', render: (row) => row.payment_id || '—' },
    { header: 'Status', value: (row) => row.status, render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Date',
      value: (row) => row.created_at?.slice(0, 10),
      render: (row) => new Date(row.created_at).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Payments</h2>
        <p className="text-slate-500">Track all transaction records.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <FilterPills
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { id: 'all', label: 'All', count: payments.length },
          ...STATUSES.map((s) => ({
            id: s,
            label: s.charAt(0).toUpperCase() + s.slice(1),
            count: payments.filter((p) => p.status === s).length,
          })),
        ]}
      />

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <DataTable
          data={displayed}
          columns={columns}
          exportFileName="payments"
          searchPlaceholder="Search by student, program or transaction ID…"
        />
      )}

      {selectedStudent && <StudentDetails student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
    </div>
  );
}
