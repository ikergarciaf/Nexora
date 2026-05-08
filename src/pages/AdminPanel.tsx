import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building2, CreditCard, BarChart, Activity, Settings, LogOut, Search, ChevronDown, MoreHorizontal, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { NexoraLogo } from '../components/NexoraLogo';

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

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
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
                activeView === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main */}
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
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Resumen del Sistema</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clínicas Activas', value: '12', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Usuarios Totales', value: '48', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ingresos Mensuales', value: '2.840 €', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pruebas Gratis', value: '5', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-xl p-6 border border-slate-200/70`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/70 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {[
            { action: 'Nueva clínica registrada', detail: 'Clínica Dental Sonrisas', time: 'Hace 2h' },
            { action: 'Pago procesado', detail: 'Plan Pro - Clínica Vital', time: 'Hace 5h' },
            { action: 'Usuario bloqueado', detail: 'usuario@ejemplo.com', time: 'Hace 1d' },
            { action: 'Actualización de plan', detail: 'Starter → Pro - Centro Movimiento', time: 'Hace 2d' },
          ].map((act, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <div className="text-sm font-medium text-slate-900">{act.action}</div>
                <div className="text-xs text-slate-500">{act.detail}</div>
              </div>
              <span className="text-xs text-slate-400">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Gestión de Usuarios</h2>
      <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar usuarios..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { name: 'Iker García', email: 'ikergarciafdez1@gmail.com', status: 'Activo', role: 'Super Admin' },
              { name: 'Ana López', email: 'ana@clinica.com', status: 'Activo', role: 'Owner' },
              { name: 'Carlos Ruiz', email: 'carlos@demo.com', status: 'Inactivo', role: 'Staff' },
            ].map((u, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                      {u.name.split(' ').map(p => p[0]).join('')}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.status === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {u.status === 'Activo' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{u.role}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm text-[#008477] hover:underline font-medium">Gestionar</button>
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
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Clínicas</h2>
      <div className="grid gap-4">
        {[
          { name: 'Clínica Dental Rivas', plan: 'Pro', users: 3, status: 'Activa' },
          { name: 'Centro Movimiento', plan: 'Starter', users: 1, status: 'Activa' },
          { name: 'Clínica Estética Soler', plan: 'Web Pro', users: 2, status: 'Trial' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/70 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{c.name}</div>
                <div className="text-xs text-slate-500">Plan {c.plan} · {c.users} usuarios</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                c.status === 'Activa' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>{c.status}</span>
              <button className="text-sm text-[#008477] hover:underline font-medium">Acceder</button>
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
          { name: 'Enterprise', price: 'Personalizado', desc: 'Para grandes centros', features: ['Todo Pro', 'Usuarios ilimitados', 'Soporte dedicado'], color: 'bg-indigo-600' },
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
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Pagos Recientes</h2>
      <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="px-4 py-3">Clínica</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Importe</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { clinic: 'Clínica Dental Rivas', plan: 'Pro', amount: '59€', status: 'Pagado', date: '01/05/2026' },
              { clinic: 'Centro Movimiento', plan: 'Starter', amount: '29€', status: 'Pagado', date: '01/05/2026' },
              { clinic: 'Clínica Estética Soler', plan: 'Web Pro', amount: '89€', status: 'Pendiente', date: '15/05/2026' },
            ].map((p, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{p.clinic}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.plan}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{p.amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.status === 'Pagado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.date}</td>
              </tr>
            ))}
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
            <div className="font-medium text-slate-900">Mantenimiento</div>
            <div className="text-sm text-slate-500">Activar modo mantenimiento de la plataforma</div>
          </div>
          <button className="w-10 h-5 rounded-full bg-slate-200 relative">
            <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">Registro abierto</div>
            <div className="text-sm text-slate-500">Permitir nuevos registros de clínicas</div>
          </div>
          <button className="w-10 h-5 rounded-full bg-emerald-500 relative">
            <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-4">API Keys</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-mono text-slate-600">Stripe ****sk_test_...</span>
              <button className="text-xs text-[#008477] font-medium hover:underline">Actualizar</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-mono text-slate-600">Gemini AI ****configured</span>
              <button className="text-xs text-[#008477] font-medium hover:underline">Actualizar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
