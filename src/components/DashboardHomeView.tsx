import React from 'react';
import { 
  Users, Calendar, TrendingUp, DollarSign, Activity, ArrowRight,
  Clock, Plus, Filter, Download, MoreHorizontal, Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';

interface DashboardHomeViewProps {
  stats: any;
  appointments: any[];
  patients: any[];
  isDarkMode: boolean;
  onAddAppointment: () => void;
  onAddPatient: () => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  stats,
  appointments,
  patients,
  isDarkMode,
  onAddAppointment,
  onAddPatient
}) => {
  const chartData = [
    { name: 'Lunes', rev: 4000, apt: 24 },
    { name: 'Martes', rev: 3000, apt: 18 },
    { name: 'Miércoles', rev: 5000, apt: 32 },
    { name: 'Jueves', rev: 4500, apt: 28 },
    { name: 'Viernes', rev: 6000, apt: 35 },
    { name: 'Sábado', rev: 2000, apt: 12 },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            Panel de Inicio
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}>
            Visualiza el rendimiento de Nexora Clinic hoy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onAddPatient}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-all ${
              isDarkMode ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-white border-gray-200 text-[#4f566b] hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Paciente
          </button>
          <button 
            onClick={onAddAppointment}
            className="flex items-center gap-2 px-4 py-2 bg-[#008477] hover:bg-[#006b60] text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-[#008477]/20"
          >
            <Plus className="w-4 h-4" />
            Agendar Cita
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ingresos Mensuales', value: `€${stats?.monthlyRevenue || 0}`, change: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Citas (Semana)', value: stats?.appointmentsThisWeek || 0, change: '+4 proyectadas', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Pacientes Activos', value: stats?.activePatients || 0, change: 'últimos 6 meses', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Tasa No-Show', value: `${stats?.noShowRate || 0}%`, change: '-1.2% vs avg', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((kpi, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.color} bg-opacity-10`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{kpi.value.toLocaleString('es-ES')}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Rendimiento Semanal</h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                <TrendingUp size={14} /> 12% más que la semana anterior
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008477" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#008477" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8792a2'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
                    borderColor: isDarkMode ? '#334155' : '#e3e8ee',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="rev" stroke="#008477" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nexora AI Mini Widget */}
        <div className={`p-6 rounded-2xl border bg-gradient-to-br from-[#008477] to-[#006b60] text-white shadow-xl shadow-[#008477]/20`}>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest">Nexora Intelligence</span>
          </div>
          <p className="text-xl font-bold leading-tight mb-4">
            Echa un vistazo a las sugerencias de la IA para hoy.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-emerald-300 uppercase mb-1">Optimizador</p>
              <p className="text-sm font-medium">Hay 2 huecos libres mañana las 10:00. ¿Quieres que contactemos con pacientes en espera?</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-emerald-300 uppercase mb-1">Marketing</p>
              <p className="text-sm font-medium">5 pacientes reactivados ayer mediante recordatorios de WhatsApp automáticos.</p>
            </div>
          </div>
          <button className="w-full mt-6 py-3 bg-white text-[#008477] rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
            Ver Insights <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
