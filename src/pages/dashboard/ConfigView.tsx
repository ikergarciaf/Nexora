import React, { useCallback, useRef, useState } from 'react';
import { User, Sun, Moon, Map, Save, Eye, Info, CheckCircle2, Mail, Phone, Clock, Brain, Rocket, Package, Upload, Trash2, Download, AlertTriangle } from 'lucide-react';
import { updateTenantConfigApi } from '../../hooks/useDashboardData';
import { DashboardViewWithConfigProps } from './types';

interface ConfigViewProps extends DashboardViewWithConfigProps {
  onUpdateConfig: (config: any) => void;
  tenantConfig: any;
}

export default function ConfigView({ isDarkMode, clinicConfig, onUpdateConfig }: ConfigViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const updateClinicConfig = useCallback((newConfig: Partial<typeof clinicConfig>) => {
    onUpdateConfig({ ...clinicConfig, ...newConfig });
  }, [clinicConfig, onUpdateConfig]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La imagen debe ser menor de 2 MB'); return; }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const token = localStorage.getItem('clinic_token');
        const res = await fetch('/api/upload/logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await res.json();
        if (data.logoUrl) updateClinicConfig({ logoUrl: data.logoUrl });
      };
    } finally {
      setUploading(false);
    }
  };

  const handleLogoDelete = async () => {
    const token = localStorage.getItem('clinic_token');
    const res = await fetch('/api/upload/logo', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) updateClinicConfig({ logoUrl: '' });
  };

  const handleSaveConfig = async () => {
    const ok = await updateTenantConfigApi({ 
      name: clinicConfig.name, 
      slug: clinicConfig.slug,
      address: clinicConfig.address,
      owner: clinicConfig.owner,
      specialty: clinicConfig.specialty,
      description: clinicConfig.description,
      themeColor: clinicConfig.themeColor,
      logoUrl: clinicConfig.logoUrl,
      contactPhone: clinicConfig.contactPhone,
      contactEmail: clinicConfig.contactEmail
    });
    if (ok) {
      alert('Configuración guardada correctamente.');
    } else {
      alert('Hubo un error al guardar la configuración.');
    }
  };

  return (
    <div className="px-4 md:px-8 xl:px-12 max-w-4xl mx-auto pb-24 mt-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className={`text-[28px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Configuración</h1>
          <p className={`text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Gestiona los detalles de tu clínica y las preferencias del sistema.</p>
        </div>
        <button 
          onClick={handleSaveConfig}
          className="px-6 py-2.5 bg-[#5469d4] text-white rounded-xl font-bold shadow-md hover:bg-[#4c5ed1] transition-colors"
        >
          Guardar Configuración
        </button>
      </div>

      <div className="space-y-8">
        {/* General Info */}
        <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <h3 className={`text-[17px] font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            <User className="w-5 h-5 text-[#5469d4]" /> Información General de la Clínica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Nombre de la Clínica</label>
              <input 
                type="text" 
                value={clinicConfig.name}
                onChange={(e) => updateClinicConfig({ name: e.target.value })}
                className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Titular / Director</label>
              <input 
                type="text" 
                value={clinicConfig.owner}
                onChange={(e) => updateClinicConfig({ owner: e.target.value })}
                className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Color Corporativo (Hex)</label>
              <input 
                type="text" 
                value={clinicConfig.themeColor || '#008477'}
                onChange={(e) => updateClinicConfig({ themeColor: e.target.value })}
                className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Dirección Física</label>
              <input 
                type="text" 
                value={clinicConfig.address}
                onChange={(e) => updateClinicConfig({ address: e.target.value })}
                className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Teléfono de Contacto</label>
              <input 
                type="text" 
                value={clinicConfig.contactPhone || ''}
                onChange={(e) => updateClinicConfig({ contactPhone: e.target.value })}
                className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Email de Contacto</label>
              <input 
                type="email" 
                value={clinicConfig.contactEmail || ''}
                onChange={(e) => updateClinicConfig({ contactEmail: e.target.value })}
                className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Logo de la Clínica</label>
              <div className="flex items-center gap-3">
                {clinicConfig.logoUrl ? (
                  <div className="relative group">
                    <img src={clinicConfig.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover ring-1 ring-slate-200" />
                    <button onClick={handleLogoDelete} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-400">
                    <Upload className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-medium hover:bg-slate-200 transition-colors disabled:opacity-50">
                    {uploading ? 'Subiendo...' : (clinicConfig.logoUrl ? 'Cambiar logo' : 'Subir logo')}
                  </button>
                  <p className="text-[11px] text-gray-500 mt-1">PNG, JPG o WebP. Máximo 2 MB.</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Especialidad Clínica Principal</label>
              <select 
                value={clinicConfig.specialty}
                onChange={(e) => updateClinicConfig({ specialty: e.target.value })}
                className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
              >
                <option value="Odontología">Odontología (Odontograma)</option>
                <option value="Fisioterapia">Fisioterapia (Mapa de Dolor)</option>
                <option value="General">Medicina General / Otros</option>
                <option value="Nutrición">Nutrición</option>
              </select>
              <p className="text-[11px] text-gray-500 mt-1">Este ajuste cambiará automáticamente el tipo de ficha médica que verás en cada paciente.</p>
            </div>
          </div>
        </div>

        {/* Horarios de Apertura */}
        <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-[17px] font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
              <Clock className="w-5 h-5 text-[#5469d4]" /> Horarios de Apertura
            </h3>
          </div>
          <div className="space-y-3">
            {clinicConfig.openingHours.map((hour: any, idx: number) => (
              <div key={hour.day} className="flex flex-wrap items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className={`w-24 text-[14px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>{hour.day}</div>
                <div className="flex items-center gap-3">
                  <input 
                    type="time" 
                    value={hour.open}
                    disabled={hour.closed}
                    onChange={(e) => {
                      const newHours = [...clinicConfig.openingHours];
                      newHours[idx].open = e.target.value;
                      updateClinicConfig({ openingHours: newHours });
                    }}
                    className={`px-3 py-1.5 rounded-[6px] border text-[13px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white disabled:opacity-30' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#1a1f36] disabled:opacity-40'}`}
                  />
                  <span className="text-gray-400">a</span>
                  <input 
                    type="time" 
                    value={hour.close}
                    disabled={hour.closed}
                    onChange={(e) => {
                      const newHours = [...clinicConfig.openingHours];
                      newHours[idx].close = e.target.value;
                      updateClinicConfig({ openingHours: newHours });
                    }}
                    className={`px-3 py-1.5 rounded-[6px] border text-[13px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white disabled:opacity-30' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#1a1f36] disabled:opacity-40'}`}
                  />
                </div>
                <button 
                  onClick={() => {
                    const newHours = [...clinicConfig.openingHours];
                    newHours[idx].closed = !newHours[idx].closed;
                    updateClinicConfig({ openingHours: newHours });
                  }}
                  className={`ml-auto px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${hour.closed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                >
                  {hour.closed ? 'CERRADO' : 'ABIERTO'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Public Links */}
        <div className={`rounded-[12px] border p-8 transition-colors flex flex-col gap-4 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <h3 className={`text-[17px] font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            <Rocket className="w-5 h-5 text-[#5469d4]" /> Demo de Asistente Virtual
          </h3>
          <p className={`text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Prueba las integraciones de tu clínica para validarlas.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href={window.location.origin + '/whatsapp-demo?slug=' + (clinicConfig.slug || localStorage.getItem('active_tenant_id') || '')} target="_blank" rel="noreferrer" className="p-4 border rounded-xl hover:border-[#25D366] transition-all flex flex-col gap-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="font-bold text-[#25D366] flex items-center gap-2"><Phone className="w-4 h-4"/> Demo WhatsApp Bot</div>
              <div className={`text-[12px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Prueba tu asistente de WhatsApp de Nexora configurado para tu clínica.</div>
            </a>
          </div>
        </div>

        {/* AI & Automation */}
        <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <h3 className={`text-[17px] font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            <Brain className="w-5 h-5 text-[#5469d4]" /> Nexora AI & Automatización
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <div>
                <div className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Asistente IA Nexora</div>
                <div className="text-[12px] text-gray-400">Activa el motor de IA para generación de notas y resúmenes.</div>
              </div>
              <button 
                onClick={() => updateClinicConfig({ aiEnabled: !clinicConfig.aiEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${clinicConfig.aiEnabled ? 'bg-[#5469d4]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${clinicConfig.aiEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <div>
                <div className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Resúmenes Automáticos</div>
                <div className="text-[12px] text-gray-400">Generar resumen clínico automáticamente al terminar cada cita.</div>
              </div>
              <button 
                onClick={() => updateClinicConfig({ autoSummaries: !clinicConfig.autoSummaries })}
                className={`w-12 h-6 rounded-full transition-colors relative ${clinicConfig.autoSummaries ? 'bg-[#5469d4]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${clinicConfig.autoSummaries ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Plan & Billing */}
        <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <h3 className={`text-[17px] font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            <Package className="w-5 h-5 text-amber-500" /> Plan y Suscripción
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <div className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Plan {clinicConfig.plan}</div>
                <div className="text-[12px] text-gray-400">Tu suscripción se renueva el 15 de Mayo, 2026.</div>
              </div>
            </div>
            <button 
              onClick={() => window.alert('Próximamente: Pasarela de cambio de plan.')}
              className="px-4 py-2 bg-[#5469d4] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all"
            >
              Mejorar Plan
            </button>
          </div>
        </div>

        {/* GDPR / Datos */}
        <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <h3 className={`text-[17px] font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            <Download className="w-5 h-5 text-purple-500" /> tus Datos (RGPD)
          </h3>
          <p className={`text-[14px] mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exporta tus datos o elimina tu cuenta definitivamente.</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => {
                setExporting(true);
                try {
                  const token = localStorage.getItem('clinic_token');
                  const res = await fetch('/api/gdpr/export', { headers: { Authorization: `Bearer ${token}` } });
                  if (!res.ok) { alert('Error al exportar datos'); return; }
                  const data = await res.json();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'nexora-export.json'; a.click();
                  URL.revokeObjectURL(url);
                } finally { setExporting(false); }
              }}
              disabled={exporting}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-[13px] font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> {exporting ? 'Exportando...' : 'Exportar mis datos'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-[13px] font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Eliminar cuenta
            </button>
          </div>
          {showDeleteConfirm && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-[13px] font-medium text-red-800 mb-3">Esta acción es irreversible. Se eliminarán todos tus datos.</p>
              <input
                type="password"
                placeholder="Introduce tu contraseña para confirmar"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full max-w-sm px-4 py-2 rounded-lg border border-red-300 text-[14px] outline-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('clinic_token');
                    const res = await fetch('/api/gdpr/delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ password: deletePassword }),
                    });
                    if (res.ok) {
                      localStorage.clear();
                      window.location.href = '/';
                    } else {
                      const err = await res.json();
                      alert(err.error || 'Error al eliminar cuenta');
                    }
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-[13px] font-medium hover:bg-red-700"
                >
                  Confirmar eliminación
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                  className="px-4 py-2 bg-white text-slate-700 rounded-lg text-[13px] font-medium ring-1 ring-slate-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
