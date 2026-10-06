import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable, { FilterPills } from '../../components/admin/DataTable';
import { useToast } from '../../components/admin/Toast';
import { Trash2, Save, Loader2, MessageSquare, Settings, X, Reply, Building2 } from 'lucide-react';

const TABS = [
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'details', label: 'Edit Contact Details', icon: Settings },
];

// Enquiries from the "For Institutions" page are saved with this prefix
const INSTITUTION_PREFIX = '[Institution enquiry]';
const isInstitution = (msg) => msg.message?.startsWith(INSTITUTION_PREFIX);
const messageBody = (msg) =>
  isInstitution(msg) ? msg.message.slice(INSTITUTION_PREFIX.length).trim() : msg.message;

const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

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
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('messages');
  const [typeFilter, setTypeFilter] = useState('all');
  const [openMessage, setOpenMessage] = useState(null);

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
    if (error) toast.error(`Could not load messages: ${error.message}`);
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
    if (error) {
      toast.error(`Could not delete: ${error.message}`);
      return;
    }
    toast.success('Message deleted');
    setOpenMessage(null);
    fetchMessages();
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
      toast.success('Contact details saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      toast.error(`Could not save: ${err.message}`);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const displayedMessages =
    typeFilter === 'all'
      ? messages
      : messages.filter((m) => (typeFilter === 'institution' ? isInstitution(m) : !isInstitution(m)));

  // — Messages columns —
  const msgColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Type',
      value: (row) => (isInstitution(row) ? 'Institution' : 'General'),
      render: (row) =>
        isInstitution(row) ? (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Building2 className="w-3 h-3" /> Institution
          </span>
        ) : (
          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">General</span>
        ),
    },
    {
      header: 'Message',
      value: (row) => messageBody(row),
      sortable: false,
      render: (row) => (
        <span className="block max-w-xs truncate text-slate-600">
          {messageBody(row)}
        </span>
      ),
    },
    {
      header: 'Received',
      value: (row) => row.created_at?.slice(0, 10),
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
              data={displayedMessages}
              columns={msgColumns}
              renderActions={renderMsgActions}
              onRowClick={setOpenMessage}
              exportFileName="messages"
              searchPlaceholder="Search messages…"
              toolbar={
                <FilterPills
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { id: 'all', label: 'All', count: messages.length },
                    { id: 'general', label: 'General', count: messages.filter((m) => !isInstitution(m)).length },
                    { id: 'institution', label: 'Institutions', count: messages.filter(isInstitution).length },
                  ]}
                />
              }
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

      {/* ── Full message ── */}
      {openMessage && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" onClick={() => setOpenMessage(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-800 truncate">{openMessage.name}</h3>
                <p className="text-sm text-slate-500 truncate">{openMessage.email}</p>
                <p className="text-xs text-slate-400 mt-1">{formatDateTime(openMessage.created_at)}</p>
              </div>
              <button onClick={() => setOpenMessage(null)} className="text-slate-400 hover:text-slate-600" title="Close">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="p-6 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{messageBody(openMessage)}</p>
            <div className="flex justify-between gap-3 p-6 pt-0">
              <button
                onClick={() => handleDeleteMessage(openMessage.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <a
                href={`mailto:${openMessage.email}?subject=${encodeURIComponent('Re: your message to SkillifyMe')}`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Reply className="w-4 h-4" /> Reply by email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
