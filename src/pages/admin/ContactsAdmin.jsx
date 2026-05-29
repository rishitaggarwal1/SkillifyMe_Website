import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/admin/DataTable';
import { Trash2, Save, Loader2, MessageSquare, Settings } from 'lucide-react';

const TABS = [
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'details', label: 'Edit Contact Details', icon: Settings },
];

const DEFAULT_INFO = {
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'India',
  working_hours: 'Mon–Sat, 9 AM – 7 PM IST',
  linkedin_url: '',
  twitter_url: '',
  instagram_url: '',
  youtube_url: '',
};

export default function ContactsAdmin() {
  const [activeTab, setActiveTab] = useState('messages');

  // — Messages state —
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);

  // — Contact info state —
  const [infoId, setInfoId] = useState(null);
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | success | error

  useEffect(() => {
    fetchMessages();
    fetchContactInfo();
  }, []);

  const fetchMessages = async () => {
    setLoadingMsgs(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching messages:', error);
    else setMessages(data);
    setLoadingMsgs(false);
  };

  const fetchContactInfo = async () => {
    setLoadingInfo(true);
    const { data } = await supabase.from('contact_info').select('*').limit(1).single();
    if (data) {
      setInfoId(data.id);
      setInfo({ ...DEFAULT_INFO, ...data });
    }
    setLoadingInfo(false);
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) console.error('Error deleting:', error);
    else fetchMessages();
  };

  const handleInfoChange = (e) =>
    setInfo({ ...info, [e.target.name]: e.target.value });

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');
    try {
      if (infoId) {
        const { error } = await supabase.from('contact_info').update(info).eq('id', infoId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('contact_info').insert([info]).select().single();
        if (error) throw error;
        setInfoId(data.id);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving contact info:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // — Messages columns —
  const msgColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Message',
      render: (row) => (
        <span className="block max-w-xs truncate text-slate-600" title={row.message}>
          {row.message}
        </span>
      ),
    },
    {
      header: 'Received',
      render: (row) =>
        new Date(row.created_at).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
    },
  ];

  const renderMsgActions = (row) => (
    <button
      onClick={() => handleDeleteMessage(row.id)}
      className="text-red-500 hover:text-red-700 transition-colors"
      title="Delete"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );

  const inputCls =
    'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Contacts</h2>
        <p className="text-slate-500">Manage incoming messages and your public contact details.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Messages Tab ── */}
      {activeTab === 'messages' && (
        <div>
          {loadingMsgs ? (
            <div className="text-center py-10 text-slate-500">Loading messages…</div>
          ) : (
            <DataTable
              data={messages}
              columns={msgColumns}
              renderActions={renderMsgActions}
            />
          )}
        </div>
      )}

      {/* ── Edit Details Tab ── */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Public Contact Information</h3>
          <p className="text-sm text-slate-500 mb-6">
            These details are shown on the public Contact page.
          </p>

          {loadingInfo ? (
            <div className="text-center py-10 text-slate-500">Loading…</div>
          ) : (
            <form onSubmit={handleSaveInfo} className="space-y-5">

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input type="email" name="email" value={info.email} onChange={handleInfoChange}
                    placeholder="contact@example.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input type="text" name="phone" value={info.phone} onChange={handleInfoChange}
                    placeholder="+91 98765 43210" className={inputCls} />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={labelCls}>Street Address</label>
                <input type="text" name="address" value={info.address} onChange={handleInfoChange}
                  placeholder="123 Tech Park, Sector 5" className={inputCls} />
              </div>

              {/* City + Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" name="city" value={info.city} onChange={handleInfoChange}
                    placeholder="New Delhi" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input type="text" name="country" value={info.country} onChange={handleInfoChange}
                    placeholder="India" className={inputCls} />
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <label className={labelCls}>Working Hours</label>
                <input type="text" name="working_hours" value={info.working_hours} onChange={handleInfoChange}
                  placeholder="Mon–Sat, 9 AM – 7 PM IST" className={inputCls} />
              </div>

              <hr className="border-slate-100" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Links (optional)</p>

              {/* Social */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>LinkedIn URL</label>
                  <input type="url" name="linkedin_url" value={info.linkedin_url} onChange={handleInfoChange}
                    placeholder="https://linkedin.com/company/..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Twitter URL</label>
                  <input type="url" name="twitter_url" value={info.twitter_url} onChange={handleInfoChange}
                    placeholder="https://twitter.com/..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Instagram URL</label>
                  <input type="url" name="instagram_url" value={info.instagram_url} onChange={handleInfoChange}
                    placeholder="https://instagram.com/..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>YouTube URL</label>
                  <input type="url" name="youtube_url" value={info.youtube_url} onChange={handleInfoChange}
                    placeholder="https://youtube.com/@..." className={inputCls} />
                </div>
              </div>

              {/* Save */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm disabled:opacity-75"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>

                {saveStatus === 'success' && (
                  <span className="text-sm font-medium text-green-600">✓ Saved successfully</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-sm font-medium text-red-600">Failed to save. Try again.</span>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
