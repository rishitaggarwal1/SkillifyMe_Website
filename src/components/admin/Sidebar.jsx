import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  GraduationCap,
  CreditCard,
  Image,
  BookOpen,
  MessageSquare,
  Star,
  LogOut,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Courses', path: '/admin/trainings', icon: BookOpen },
  { name: 'Internships', path: '/admin/internships', icon: Briefcase },
  { name: 'Applications', path: '/admin/applications', icon: GraduationCap },
  { name: 'Students', path: '/admin/students', icon: Users },
  { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  { name: 'Gallery', path: '/admin/gallery', icon: Image },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Contacts', path: '/admin/contacts', icon: MessageSquare },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      {/* Dark backdrop behind the menu on small screens */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-full transform transition-transform duration-200 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SkillifyMe Admin
          </h1>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600" title="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
