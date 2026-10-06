import React from 'react';

const COLORS = {
  enrolled: 'bg-green-100 text-green-800',
  paid: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  applied: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// Coloured pill for application / payment statuses
export function StatusBadge({ status }) {
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${COLORS[status] || 'bg-slate-100 text-slate-800'}`}>
      {capitalize(status) || '—'}
    </span>
  );
}
