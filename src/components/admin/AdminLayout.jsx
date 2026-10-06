import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ToastProvider } from './Toast';

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu after navigating
  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  return (
    <ToastProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
