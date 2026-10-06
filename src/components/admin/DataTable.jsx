import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';

// Column options:
//   header      – column title
//   accessor    – field name to show (also used for search, sort and CSV)
//   render      – custom cell content
//   value(row)  – plain value for search, sort and CSV when the column uses render
//   sortable    – set to false to disable sorting
//   hidden      – not shown, but still searchable and included in the CSV
const cellValue = (col, row) => {
  if (col.value) return col.value(row);
  if (col.accessor) return row[col.accessor];
  return undefined;
};

const toCsvCell = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function DataTable({
  columns,
  data,
  keyField = 'id',
  renderActions,
  onRowClick,
  pageSize = 15,
  searchPlaceholder = 'Search…',
  exportFileName,
  toolbar,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ index: null, dir: 'asc' });
  const [page, setPage] = useState(0);

  const valueColumns = columns.filter((c) => c.value || c.accessor);
  const visibleColumns = columns.filter((c) => !c.hidden);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data;
    if (q) {
      rows = rows.filter((row) =>
        valueColumns.some((col) => String(cellValue(col, row) ?? '').toLowerCase().includes(q))
      );
    }
    if (sort.index !== null) {
      const col = visibleColumns[sort.index];
      rows = [...rows].sort((a, b) => {
        const va = cellValue(col, a);
        const vb = cellValue(col, b);
        if (va === vb) return 0;
        if (va === null || va === undefined || va === '') return 1;
        if (vb === null || vb === undefined || vb === '') return -1;
        const na = Number(va);
        const nb = Number(vb);
        const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, query, sort, columns]);

  // Go back to the first page when the search or the number of rows changes
  useEffect(() => setPage(0), [query, data.length]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const toggleSort = (index) => {
    setSort((s) =>
      s.index === index ? { index, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { index, dir: 'asc' }
    );
  };

  const exportCsv = () => {
    const header = valueColumns.map((c) => toCsvCell(c.header)).join(',');
    const lines = filtered.map((row) => valueColumns.map((c) => toCsvCell(cellValue(c, row))).join(','));
    // BOM so Excel opens ₹ and other Unicode correctly
    const blob = new Blob(['\uFEFF' + [header, ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colSpan = visibleColumns.length + (renderActions ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-4 border-b border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {toolbar}
          {exportFileName && (
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {visibleColumns.map((col, idx) => {
                const sortable = col.sortable !== false && (col.value || col.accessor);
                const active = sort.index === idx;
                return (
                  <th
                    key={idx}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    {sortable ? (
                      <button
                        onClick={() => toggleSort(idx)}
                        className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-slate-800"
                      >
                        {col.header}
                        {active ? (
                          sort.dir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
              {renderActions && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-8 text-center text-slate-500">
                  {query ? `No results for "${query}".` : 'No records found.'}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row[keyField]}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {visibleColumns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {renderActions && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 text-sm text-slate-500">
        <span>
          {filtered.length === 0
            ? '0 records'
            : `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filtered.length)} of ${filtered.length}`}
        </span>
        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">Page {currentPage + 1} of {pageCount}</span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount - 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Pill buttons for filtering a table, e.g. by status. options: [{ id, label, count }]
export function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            value === o.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={`px-1.5 rounded-full ${value === o.id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
