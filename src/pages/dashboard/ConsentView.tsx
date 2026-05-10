import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, Eye, X, Loader2, CheckCircle2, AlertTriangle, Undo2 } from 'lucide-react';
import SignaturePad from '../../components/SignaturePad';
import type { DashboardViewProps } from './types';
import { apiHeaders } from '../../services/api';

export default function ConsentView({ isDarkMode, onNavigate }: DashboardViewProps) {
  const [consents, setConsents] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailConsent, setDetailConsent] = useState<any>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ patientId: '', title: '', content: '' });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchConsents = useCallback(async () => {
    try {
      const res = await fetch('/api/consents', { headers: apiHeaders() });
      if (res.ok) setConsents(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/patients', { headers: apiHeaders() });
      if (res.ok) {
        const json = await res.json();
        setPatients(json.data || json);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchConsents(); fetchPatients(); }, [fetchConsents, fetchPatients]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.title || !form.content) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/consents', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) { alert('Error al crear consentimiento'); return; }
      const consent = await res.json();
      if (signatureDataUrl) {
        await fetch(`/api/consents/${consent.id}/sign`, {
          method: 'PUT',
          headers: apiHeaders(),
          body: JSON.stringify({ signatureDataUrl }),
        });
      }
      setShowCreateModal(false);
      setForm({ patientId: '', title: '', content: '' });
      setSignatureDataUrl(null);
      fetchConsents();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('¿Revocar este consentimiento? El paciente deberá firmar uno nuevo.')) return;
    await fetch(`/api/consents/${id}/revoke`, { method: 'PUT', headers: apiHeaders() });
    fetchConsents();
  };

  const handleView = (consent: any) => {
    setDetailConsent(consent);
    setShowDetailModal(true);
  };

  const filtered = consents.filter((c: any) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.patient?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    if (status === 'signed') return { label: 'Firmado', cls: isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-[#e8f5e9] text-[#1b5e20]' };
    if (status === 'revoked') return { label: 'Revocado', cls: isDarkMode ? 'bg-red-900/40 text-red-400' : 'bg-[#ffebee] text-[#c62828]' };
    return { label: 'Borrador', cls: isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-24 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Consentimientos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Consentimiento
        </button>
      </div>

      <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          <Search className="w-4 h-4 text-[#8792a2]" />
          <input
            type="text"
            placeholder="Buscar por título o paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}
          />
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#5469d4]" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <FileText className="w-8 h-8 text-[#8792a2] mb-3" />
              <h3 className={`text-[14px] font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No hay consentimientos</h3>
              <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Crea el primer consentimiento informado para tu clínica.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                  <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Título</th>
                  <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Paciente</th>
                  <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Estado</th>
                  <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
                {filtered.map((c: any) => {
                  const badge = statusBadge(c.status);
                  return (
                    <tr key={c.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                      <td className="px-4 py-3">
                        <span className={`text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{c.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[13px] ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>{c.patient?.fullName || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${badge.cls}`}>
                          {c.status === 'signed' ? <CheckCircle2 className="w-3 h-3" /> : c.status === 'revoked' ? <AlertTriangle className="w-3 h-3" /> : null}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                          {new Date(c.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleView(c)} className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-[#e3e8ee] text-[#8792a2]'}`}>
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.status === 'signed' && (
                            <button onClick={() => handleRevoke(c.id)} className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-[#ffebee] text-[#e53935]'}`}>
                              <Undo2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={() => !submitting && setShowCreateModal(false)}>
          <div className={`w-full max-w-2xl rounded-[12px] border shadow-xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
              <h3 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Nuevo Consentimiento Informado</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Paciente *</label>
                <select
                  required
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-[4px] text-[13px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white' : 'bg-white border-[#e3e8ee] text-[#1a1f36]'}`}
                >
                  <option value="">Seleccionar paciente...</option>
                  {patients.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej. Consentimiento informado para tratamiento de ortodoncia"
                  className={`w-full px-3 py-2 border rounded-[4px] text-[13px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white' : 'bg-white border-[#e3e8ee] text-[#1a1f36]'}`}
                />
              </div>
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Contenido del consentimiento *</label>
                <textarea
                  required
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Describe el tratamiento, riesgos, alternativas y demás información que el paciente debe conocer y aceptar..."
                  className={`w-full px-3 py-2 border rounded-[4px] text-[13px] outline-none transition-all resize-y ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white' : 'bg-white border-[#e3e8ee] text-[#1a1f36]'}`}
                />
              </div>
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Firma del paciente</label>
                <SignaturePad onSave={(dataUrl) => setSignatureDataUrl(dataUrl)} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-700">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 disabled:opacity-50">
                  {submitting ? 'Guardando...' : 'Guardar Consentimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailConsent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDetailModal(false)}>
          <div className={`w-full max-w-2xl rounded-[12px] border shadow-xl ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
              <h3 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{detailConsent.title}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <span className="text-gray-400">Paciente:</span>
                  <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{detailConsent.patient?.fullName || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Estado:</span>
                  <span className={`ml-2 font-medium ${detailConsent.status === 'signed' ? 'text-green-600' : detailConsent.status === 'revoked' ? 'text-red-600' : ''}`}>
                    {statusBadge(detailConsent.status).label}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Creado:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{new Date(detailConsent.createdAt).toLocaleString('es-ES')}</span>
                </div>
                {detailConsent.signedAt && (
                  <div>
                    <span className="text-gray-400">Firmado:</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{new Date(detailConsent.signedAt).toLocaleString('es-ES')}</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className={`text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Contenido</h4>
                <div className={`p-4 rounded-[8px] text-[13px] whitespace-pre-wrap ${isDarkMode ? 'bg-[#0f172a] text-gray-300' : 'bg-[#f6f9fc] text-[#1a1f36]'}`}>
                  {detailConsent.content}
                </div>
              </div>
              {detailConsent.signatureDataUrl && (
                <div>
                  <h4 className={`text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Firma del paciente</h4>
                  <img src={detailConsent.signatureDataUrl} alt="Firma" className="border rounded-lg bg-white max-w-sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
