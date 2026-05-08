import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NexoraLogo } from '../components/NexoraLogo';

const SPECIALTIES = [
  { value: 'Fisioterapia', desc: 'Nexora Fisioterapia', color: '#0f172a' },
  { value: 'Odontología', desc: 'Nexora Dental', color: '#008477' },
  { value: 'Nutrición', desc: 'Nexora Nutrición', color: '#059669' },
  { value: 'Psicología', desc: 'Nexora Psicología', color: '#7c3aed' },
  { value: 'Estética', desc: 'Nexora Estética', color: '#db2777' },
  { value: 'Medicina General', desc: 'Nexora Clinical', color: '#5469d4' },
];

export default function TenantSelector() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSpecialty, setFilterSpecialty] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('clinic_token');
    if (!token) { navigate('/login'); return; }
    try { setUser(JSON.parse(localStorage.getItem('user_info') || '{}')); } catch {}
    fetchTenants();
  }, [navigate]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/tenants', {
        headers: { Authorization: `Bearer ${localStorage.getItem('clinic_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setTenants(data);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (tenantId: string, name: string) => {
    localStorage.setItem('active_tenant_id', tenantId);
    localStorage.setItem('clinic-name', name);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('clinic_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('active_tenant_id');
    navigate('/login');
  };

  const grouped = SPECIALTIES.map(s => ({
    ...s,
    tenants: tenants.filter((t: any) => (t.specialty || 'Fisioterapia') === s.value),
  })).filter(g => g.tenants.length > 0);

  const filteredGroups = filterSpecialty
    ? grouped.filter(g => g.value === filterSpecialty)
    : grouped;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NexoraLogo size={28} />
            <span className="text-lg font-semibold text-gray-900">Nexora</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Selecciona un SaaS</h1>
            <p className="text-gray-500 mt-1">Elige el entorno que quieres gestionar</p>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
            >
              {filterSpecialty
                ? SPECIALTIES.find(s => s.value === filterSpecialty)?.desc
                : 'Todas las especialidades'}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full right-0 pt-2 z-50"
                >
                  <div className="w-56 bg-white rounded-xl shadow-lg ring-1 ring-slate-200/70 py-2">
                    <button
                      onClick={() => { setFilterSpecialty(null); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[14px] transition-colors ${!filterSpecialty ? 'text-[#008477] font-semibold' : 'text-slate-600 hover:text-[#008477] hover:bg-slate-50'}`}
                    >
                      Todas las especialidades
                    </button>
                    {SPECIALTIES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => { setFilterSpecialty(s.value); setFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-[14px] transition-colors flex items-center gap-2 ${filterSpecialty === s.value ? 'text-[#008477] font-semibold' : 'text-slate-600 hover:text-[#008477] hover:bg-slate-50'}`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.desc}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {user?.isSuperAdmin && (
          <div className="mb-6 bg-purple-50 text-purple-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-purple-100">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Administrador — tienes acceso a todos los entornos
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {filteredGroups.map(group => (
              <section key={group.value}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{group.desc}</h2>
                  <span className="text-xs text-gray-400 ml-1">({group.tenants.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.tenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => handleSelect(tenant.id, tenant.name)}
                      className="bg-white rounded-lg border border-gray-200 px-5 py-4 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate group-hover:text-[#008477] transition-colors">
                            {tenant.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            Plan {tenant.subscriptionPlan}
                            {tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date() && (
                              <span className="ml-2 text-amber-500">· Trial</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            {filteredGroups.length === 0 && (
              <div className="text-center py-20">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay entornos disponibles</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
