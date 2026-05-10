import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building2, CreditCard, BarChart, Activity, Settings, LogOut, Search, ChevronDown, MoreHorizontal, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { NexoraLogo } from '../components/NexoraLogo';
import { apiHeaders } from '../services/api';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'clinicas', label: 'Clínicas', icon: Building2 },
  { id: 'planes', label: 'Planes', icon: CreditCard },
  { id: 'pagos', label: 'Pagos', icon: Activity },
  { id: 'config', label: 'Configuración', icon: Settings },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user_info') || '{}');
      if (!u.isSuperAdmin) { navigate('/dashboard'); return; }
      setUser(u);
    } catch { navigate('/dashboard'); }
  }, []);

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-slate-900 text-white flex flex-col transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold text-sm">Admin Panel</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Nexora</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user?.name || 'Admin'}</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>
        <div className="p-6 max-w-7xl mx-auto">
          {activeView === 'dashboard' && <AdminDashboard />}
          {activeView === 'users' && <AdminUsers />}
          {activeView === 'clinicas' && <AdminClinics />}
          {activeView === 'planes' && <AdminPlans />}
          {activeView === 'pagos' && <AdminPayments />}
          {activeView === 'config' && <AdminConfig />}
        </div>
      </main>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: apiHeaders() })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Resumen del Sistema</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clínicas Activas', value: stats?.activeSubscriptions ?? '...', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Usuarios Totales', value: stats?.userCount ?? '...', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ingresos Mensuales', value: stats ? `${(stats.monthlyRevenue || 0).toFixed(0)} €` : '...', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pruebas Gratis', value: stats?.trials ?? '...', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-xl p-6 border border-slate-200/70`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users', { headers: apiHeaders() }).then(r => r.json()).then(setUsers).catch(() => {});
  }, []);

  const toggleActive = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}/toggle-active`, { method: 'PUT', headers: apiHeaders() });
    if (res.ok) {
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, isActive: updated.isActive } : u));
    }
  };

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Gestión de Usuarios ({users.length})</h2>
      <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar usuarios..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Clínicas</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                      {u.name?.split(' ').map((p: string) => p[0]).join('')}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{u.name} {u.isSuperAdmin && <span className="text-xs text-emerald-600 ml-1">(Super Admin)</span>}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{u.tenants?.length || 0} clínicas</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleActive(u.id)} className="text-sm text-[#008477] hover:underline font-medium">
                    {u.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminClinics() {
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/tenants', { headers: apiHeaders() }).then(r => r.json()).then(setTenants).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Clínicas ({tenants.length})</h2>
      <div className="grid gap-4">
        {tenants.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-200/70 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-500">{t.specialty} · Plan {t.plan} · {t.users} usuarios · {t.patientCount} pacientes</div>
                {t.owner && <div className="text-xs text-slate-400">Propietario: {t.owner.name}</div>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === 'active' || t.status === 'trialing' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPlans() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Planes de Suscripción</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { name: 'Starter', price: '29€', desc: 'Para profesionales independientes', features: ['Citas ilimitadas', 'Agenda básica', 'Email reminders'], color: 'bg-slate-900' },
          { name: 'Pro', price: '59€', desc: 'Para clínicas en crecimiento', features: ['Todo Starter', '5 profesionales', 'IA generativa'], color: 'bg-[#008477]' },
          { name: 'Premium', price: '119€', desc: 'Para grandes centros', features: ['Todo Pro', 'Usuarios ilimitados', 'Soporte dedicado'], color: 'bg-indigo-600' },
        ].map((plan, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/70 p-6">
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <div className="text-3xl font-bold mt-2 text-slate-900">{plan.price}<span className="text-sm font-normal text-slate-400">/mes</span></div>
            <p className="text-sm text-slate-500 mt-2">{plan.desc}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPayments() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/recent-activity', { headers: apiHeaders() }).then(r => r.json()).then(d => setInvoices(d.recentInvoices || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Pagos Recientes</h2>
      <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="px-4 py-3">Clínica</th>
              <th className="px-4 py-3">Importe</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">No hay pagos recientes</td></tr>
            ) : (
              invoices.map((inv, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{inv.tenant?.name || 'Desconocida'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{inv.amount} {inv.currency || 'EUR'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Pagado</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminConfig() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Configuración Global</h2>
      <div className="bg-white rounded-xl border border-slate-200/70 p-6 space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">Registro abierto</div>
            <div className="text-sm text-slate-500">Permitir nuevos registros de clínicas</div>
          </div>
          <div className="w-10 h-5 rounded-full bg-emerald-500 relative">
            <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-4">API Keys</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-mono text-slate-600">Stripe — configurado en .env</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-mono text-slate-600">Gemini AI — configurado en .env</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
