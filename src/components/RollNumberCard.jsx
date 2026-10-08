import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Shows a roll number with a copy button.
// compact: smaller, left-aligned version for the admin panel.
const RollNumberCard = ({ rollNumber, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rollNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (e.g. non-HTTPS); the number is still visible to copy by hand
    }
  };

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'flex-col text-center'}`}>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll number</p>
        <p className={`font-mono font-bold text-slate-900 tracking-wider ${compact ? 'text-lg' : 'text-3xl'}`}>{rollNumber}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

export default RollNumberCard;
