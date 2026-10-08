import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function Topbar({ onMenuClick }) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email || '');
    });
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:text-slate-700" title="Open menu">
          <Menu className="w-6 h-6" />
        </button>
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          View website
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
          {(email[0] || 'A').toUpperCase()}
        </div>
        <span className="text-sm font-medium text-slate-700 truncate hidden sm:block">{email || 'Admin'}</span>
      </div>
    </header>
  );
}
