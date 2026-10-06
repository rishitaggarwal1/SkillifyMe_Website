import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';
import StudentDetails from '../../components/admin/StudentDetails';
import { useToast } from '../../components/admin/Toast';

export default function StudentsAdmin() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error(`Could not load students: ${error.message}`);
    else setStudents(data);
    setLoading(false);
  };

  const columns = [
    {
      header: 'Name',
      value: (row) => row.name,
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.name}</div>
          <div className="text-slate-500 text-xs">{row.email}</div>
        </div>
      ),
    },
    { header: 'Email', accessor: 'email', hidden: true },
    { header: 'Phone', accessor: 'phone', sortable: false },
    { header: 'College', accessor: 'college' },
    {
      header: 'Course of study',
      value: (row) => [row.degree, row.branch].filter(Boolean).join(', '),
      render: (row) => [row.degree, row.branch].filter(Boolean).join(', ') || '—',
    },
    { header: 'Passout', accessor: 'passout_year' },
    {
      header: 'Resume',
      value: (row) => row.resume_url || '',
      sortable: false,
      render: (row) =>
        row.resume_url ? (
          <a
            href={row.resume_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            <FileText className="w-4 h-4" /> PDF
          </a>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      header: 'Joined',
      value: (row) => row.created_at?.slice(0, 10),
      render: (row) => new Date(row.created_at).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Students</h2>
        <p className="text-slate-500">Everyone who has enrolled or applied. Click a student to see their details.</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <DataTable
          data={students}
          columns={columns}
          onRowClick={setSelected}
          exportFileName="students"
          searchPlaceholder="Search by name, email, phone, college…"
        />
      )}

      {selected && <StudentDetails student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
