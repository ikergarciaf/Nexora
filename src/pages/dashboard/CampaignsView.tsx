import { useState, useEffect } from 'react';
import { Send, Plus, Loader2, X, Megaphone } from 'lucide-react';
import { DashboardViewProps } from './types';
import { apiHeaders } from '../../services/api';

export default function CampaignsView({ isDarkMode }: DashboardViewProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '', segment: 'ALL' });

  const loadCampaigns = async () => {
    setLoading(true);
    const res = await window.fetch('/api/campaigns', { headers: apiHeaders() });
    if (res.ok) setCampaigns(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadCampaigns(); }, []);

  const create = async () => {
    if (!form.name || !form.subject || !form.body) return;
    await window.fetch('/api/campaigns', { method: 'POST', headers: apiHeaders(), body: JSON.stringify(form) });
    setShowForm(false); setForm({ name: '', subject: '', body: '', segment: 'ALL' }); loadCampaigns();
  };

  const send = async (id: string) => {
    if (!confirm('¿Enviar esta campaña a todos los pacientes del segmento?')) return;
    setSending(true);
    await window.fetch(`/api/campaigns/${id}/send`, { method: 'POST', headers: apiHeaders() });
    loadCampaigns(); setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#008477]" /></div>;

  return (
    <div className="px-4 md:px-8 xl:px-12 max-w-5xl mx-auto pb-24 mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Marketing Email</h1>
          <p className={`text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Campañas de email segmentadas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#008477] text-white rounded-lg font-semibold hover:bg-[#006b5f]">
          <Plus className="w-4 h-4" /> Nueva campaña
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className={`w-full max-w-lg rounded-2xl p-6 ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Nueva campaña</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre de la campaña" className="w-full p-3 border rounded-lg text-sm" />
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Asunto del email" className="w-full p-3 border rounded-lg text-sm" />
              <select value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value })} className="w-full p-3 border rounded-lg text-sm">
                <option value="ALL">Todos los pacientes</option>
                <option value="booking_online">Reserva online</option>
                <option value="vip">VIP</option>
              </select>
              <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Cuerpo del email..." rows={6} className="w-full p-3 border rounded-lg text-sm" />
              <button onClick={create} className="w-full py-3 bg-[#008477] text-white rounded-lg font-semibold hover:bg-[#006b5f]">Guardar campaña</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {campaigns.map(c => (
          <div key={c.id} className={`p-5 rounded-xl border ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{c.name}</h3>
                <p className="text-sm text-gray-400">{c.subject} · {c.segment}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                {c.status === 'DRAFT' && (
                  <button onClick={() => send(c.id)} disabled={sending} className="flex items-center gap-1 px-3 py-1.5 bg-[#5469d4] text-white rounded-lg text-xs font-semibold hover:bg-[#4c5ed1]">
                    {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Enviar
                  </button>
                )}
              </div>
            </div>
            {c.sentAt && <p className="text-xs text-gray-400 mt-2">Enviado: {new Date(c.sentAt).toLocaleDateString()}</p>}
          </div>
        ))}
        {campaigns.length === 0 && <div className="text-center py-16 text-gray-400">No hay campañas aún</div>}
      </div>
    </div>
  );
}
