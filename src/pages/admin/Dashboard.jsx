import React, { useEffect, useState } from 'react';
import { Briefcase, Users, GraduationCap, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function Dashboard() {
  const [stats, setStats] = useState({
    internships: 0,
    students: 0,
    applications: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [internshipsRes, studentsRes, applicationsRes, paymentsRes] = await Promise.all([
        supabase.from('internships').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'paid')
      ]);

      const revenue = paymentsRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      setStats({
        internships: internshipsRes.count || 0,
        students: studentsRes.count || 0,
        applications: applicationsRes.count || 0,
        revenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Internships', value: stats.internships, icon: Briefcase, color: 'bg-blue-500' },
    { name: 'Total Students', value: stats.students, icon: Users, color: 'bg-purple-500' },
    { name: 'Applications', value: stats.applications, icon: GraduationCap, color: 'bg-indigo-500' },
    { name: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
  ];

  if (loading) {
    return <div className="text-center py-10">Loading stats...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome to your SkillifyMe admin dashboard.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
              <div className={`${item.color} p-4 rounded-xl text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{item.name}</p>
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
