import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable, { FilterPills } from '../../components/admin/DataTable';
import StudentDetails from '../../components/admin/StudentDetails';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useToast } from '../../components/admin/Toast';

const STATUSES = ['applied', 'enrolled', 'rejected'];

export default function ApplicationsAdmin() {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    // The server attaches the related student, internship and course to each row
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error(`Could not load applications: ${error.message}`);
    else setApplications(data);
    setLoading(false);
  };

  const updateStatus = async (row, newStatus) => {
    if (newStatus === 'rejected' && !window.confirm(`Reject the application from ${row.student?.name || 'this student'}?`)) return;
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', row.id);

    if (error) {
      toast.error(`Could not update: ${error.message}`);
      return;
    }
    toast.success(newStatus === 'enrolled' ? 'Marked as enrolled' : 'Application rejected');
    fetchApplications();
  };

  const programType = (row) => (row.course ? 'course' : row.internship ? 'internship' : '');

  const byType = typeFilter === 'all' ? applications : applications.filter((a) => programType(a) === typeFilter);
  const displayed = statusFilter === 'all' ? byType : byType.filter((a) => a.status === statusFilter);

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
    { header: 'Phone', value: (row) => row.student?.phone, hidden: true },
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
    { header: 'Type', value: (row) => programType(row), hidden: true },
    {
      header: 'Roll No.',
      value: (row) => row.roll_number,
      render: (row) =>
        row.roll_number ? (
          <span className="font-mono font-semibold text-slate-800">{row.roll_number}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    { header: 'Status', value: (row) => row.status, render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Payment', value: (row) => row.payment_status, render: (row) => <StatusBadge status={row.payment_status} /> },
    {
      header: 'Date',
      value: (row) => row.created_at?.slice(0, 10),
      render: (row) => new Date(row.created_at).toLocaleDateString('en-IN'),
    },
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-2">
      {row.status !== 'enrolled' && (
        <button
          onClick={() => updateStatus(row, 'enrolled')}
          className="text-xs font-medium text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
        >
          Enroll
        </button>
      )}
      {row.status !== 'rejected' && (
        <button
          onClick={() => updateStatus(row, 'rejected')}
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
        <p className="text-slate-500">
          Course enrollments and internship applications. Roll numbers are issued when a course enrollment is paid.
          Click a student's name for details.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <FilterPills
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { id: 'all', label: 'All', count: byType.length },
            ...STATUSES.map((s) => ({
              id: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
              count: byType.filter((a) => a.status === s).length,
            })),
          ]}
        />
        <FilterPills
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { id: 'all', label: 'All programs' },
            { id: 'course', label: 'Courses' },
            { id: 'internship', label: 'Internships' },
          ]}
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <DataTable
          data={displayed}
          columns={columns}
          renderActions={renderActions}
          exportFileName="applications"
          searchPlaceholder="Search by student, program or roll number…"
        />
      )}

      {selectedStudent && <StudentDetails student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
    </div>
  );
}
