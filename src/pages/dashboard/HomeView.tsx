import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Home, Wallet, ArrowRightLeft, Users, Package, CreditCard, FileText, BarChart, MoreHorizontal, Code, Search, Grid, HelpCircle, Bell, Settings, Plus, ChevronDown, CheckCircle2, Info, X, Map, User, LogOut, ArrowRight, Menu, Mail, Phone, Pencil, Trash2, Download, Sun, Moon, Brain, Rocket, Clock, Calendar, Sparkles, Stethoscope, Loader2 } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardViewProps } from './types';

interface HomeViewProps extends DashboardViewProps {
  clinicConfig: any;
  currentSpecialtyConfig: any;
}

export default function HomeView({ isDarkMode, onNavigate, clinicConfig, currentSpecialtyConfig }: HomeViewProps) {
  const quickActions = [
    { id: 'pacientes', label: 'Nuevo paciente', icon: Users, color: 'bg-blue-500', desc: 'Registrar un nuevo paciente en el sistema' },
    { id: 'agenda', label: 'Nueva cita', icon: Calendar, color: 'bg-emerald-500', desc: 'Agendar una cita en la agenda' },
    { id: 'tratamientos', label: 'Nuevo servicio', icon: Package, color: 'bg-amber-500', desc: 'Añadir un tratamiento o servicio' },
    { id: 'facturación', label: 'Nueva factura', icon: FileText, color: 'bg-purple-500', desc: 'Crear una factura para un paciente' },
  ];
  const { stats, appointments, patients } = useDashboardData();

  const [activePeriod, setActivePeriod] = useState('Mensual');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [activeResumenPeriod, setActiveResumenPeriod] = useState('Últimos 7 días');
  const [isResumenPeriodMenuOpen, setIsResumenPeriodMenuOpen] = useState(false);
  const [isPatientsMenuOpen, setIsPatientsMenuOpen] = useState(false);
  const [activeDiarioPeriod, setActiveDiarioPeriod] = useState('Diario');
  const [isDiarioMenuOpen, setIsDiarioMenuOpen] = useState(false);
  const [isCompareMenuOpen, setIsCompareMenuOpen] = useState(false);
  const [activePrevPeriod, setActivePrevPeriod] = useState('Período anterior');
  const [isPrevPeriodMenuOpen, setIsPrevPeriodMenuOpen] = useState(false);
  const [isCompareActive, setIsCompareActive] = useState(false);
  const [isToolbarAddOpen, setIsToolbarAddOpen] = useState(false);

  const periodMenuRef = useRef<HTMLDivElement>(null);
  const resumenPeriodMenuRef = useRef<HTMLDivElement>(null);
  const patientsMenuRef = useRef<HTMLDivElement>(null);
  const diarioMenuRef = useRef<HTMLDivElement>(null);
  const compareMenuRef = useRef<HTMLDivElement>(null);
  const prevPeriodMenuRef = useRef<HTMLDivElement>(null);
  const toolbarAddRef = useRef<HTMLDivElement>(null);

  const reactivationCandidates = useMemo(() => {
    const now = new Date();
    return patients.filter((p: any) => {
      if (!p.lastVisit) return false;
      const lastVisitDate = new Date(p.lastVisit);
      const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return diffMonths >= 6;
    });
  }, [patients]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (periodMenuRef.current && !periodMenuRef.current.contains(event.target as Node)) setIsPeriodMenuOpen(false);
      if (resumenPeriodMenuRef.current && !resumenPeriodMenuRef.current.contains(event.target as Node)) setIsResumenPeriodMenuOpen(false);
      if (patientsMenuRef.current && !patientsMenuRef.current.contains(event.target as Node)) setIsPatientsMenuOpen(false);
      if (diarioMenuRef.current && !diarioMenuRef.current.contains(event.target as Node)) setIsDiarioMenuOpen(false);
      if (compareMenuRef.current && !compareMenuRef.current.contains(event.target as Node)) setIsCompareMenuOpen(false);
      if (prevPeriodMenuRef.current && !prevPeriodMenuRef.current.contains(event.target as Node)) setIsPrevPeriodMenuOpen(false);
      if (toolbarAddRef.current && !toolbarAddRef.current.contains(event.target as Node)) setIsToolbarAddOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1440px] mx-auto pb-24">
      {/* HOY Section */}
      <div className="mt-4 mb-10">
        <h1 className={`text-[28px] font-bold tracking-tight mb-6 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Hoy</h1>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className={`group flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-md ${
                isDarkMode
                  ? 'bg-[#1e293b] border-[#334155] hover:border-blue-500/50'
                  : 'bg-white border-[#e3e8ee] hover:border-blue-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center shrink-0 text-white shadow-sm`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <div className={`text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{action.label}</div>
                <div className={`text-[12px] mt-0.5 leading-tight ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>{action.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {reactivationCandidates.length > 0 && (
          <div className={`mb-8 p-4 border rounded-[8px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-800/50' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center mt-0.5 ${isDarkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-[#5469d4]'}`}>
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-[15px] font-bold ${isDarkMode ? 'text-blue-100' : 'text-[#1a1f36]'}`}>Sugerencia de Contexto Inteligente</h4>
                <p className={`text-[13px] mt-0.5 ${isDarkMode ? 'text-blue-200' : 'text-[#4f566b]'}`}>
                  Hemos detectado que <strong>{reactivationCandidates[0].fullName}</strong> no viene desde hace más de 6 meses. ¿Quieres enviarle un mensaje de reactivación?
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate('nexora_ai')}
              className={`shrink-0 px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-[#5469d4] text-white hover:bg-[#4c5ed1]'}`}
            >
              Cargar en Generador
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {/* Left Col */}
          <div className={`flex flex-col border-b pb-4 mb-4 md:border-b-0 md:pb-0 md:mb-0 transition-colors ${isDarkMode ? 'border-gray-800' : 'border-[#e3e8ee]'}`}>
            <div className="flex items-start gap-12">
              <div ref={periodMenuRef} className="relative">
                <button
                  onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                  className={`flex items-center gap-1 text-[13px] font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-[#425466] hover:text-[#1a1f36]'}`}
                >
                  Ingresos ({activePeriod}) <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPeriodMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPeriodMenuOpen && (
                  <div className={`absolute top-full left-0 mt-1 w-32 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                    {['Diario', 'Semanal', 'Mensual', 'Anual'].map(p => (
                      <button key={p} onClick={() => { setActivePeriod(p); setIsPeriodMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
                <div className={`text-[20px] font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                <div className={`text-[12px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div ref={patientsMenuRef} className="relative">
                <button
                  onClick={() => setIsPatientsMenuOpen(!isPatientsMenuOpen)}
                  className={`flex items-center gap-1 text-[13px] font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-[#425466] hover:text-[#1a1f36]'}`}
                >
                  Pacientes <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPatientsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPatientsMenuOpen && (
                  <div className={`absolute top-full left-0 mt-1 w-40 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                    <div className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Filtros rápidos</div>
                    {['Activos', 'Inactivos', 'Nuevos este mes', 'Con cita hoy'].map(f => (
                      <button key={f} onClick={() => setIsPatientsMenuOpen(false)} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                )}
                <div className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{stats?.activePatients || 0} activos</div>
              </div>
            </div>

            <div className={`mt-12 h-[2px] w-full relative flex items-end transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-[#e3e8ee]'}`}>
              <div className="absolute left-0 bottom-0 h-[2px] bg-[#80e9ff] transition-all duration-1000 ease-in-out" style={{ width: stats?.monthlyRevenue ? '33%' : '0%' }}></div>
              <div className="absolute left-0 bottom-0 h-[2px] bg-[#7a32fc] transition-all duration-1000 ease-in-out" style={{ width: stats?.monthlyRevenue ? '20%' : '0%' }}></div>
            </div>
            <div className={`flex justify-between text-[11px] mt-1 font-medium ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>
              <span>0:00</span>
              <span>23:59</span>
            </div>
          </div>

          {/* Right Col */}
          <div className="flex flex-col gap-6">
            <div className={`flex items-start justify-between border-b pb-6 transition-colors ${isDarkMode ? 'border-gray-800' : 'border-[#e3e8ee]'}`}>
              <div>
                <div className={`text-[13px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#425466]'}`}>Citas (Esta semana)</div>
                <div className={`text-[20px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats?.appointmentsThisWeek || 0}</div>
              </div>
              <button onClick={() => onNavigate('agenda')} className={`text-[13px] font-bold transition-colors mt-1 ${isDarkMode ? 'text-[#a5b4fc] hover:text-white' : 'text-[#5469d4] hover:text-[#1a1f36]'}`}>
                Ver agenda
              </button>
            </div>
            <div className={`flex items-start justify-between border-b pb-6 transition-colors ${isDarkMode ? 'border-[#1f2937]' : 'border-[#e3e8ee]'}`}>
              <div>
                <div className={`text-[13px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#425466]'}`}>Tasa de inasistencia (No-Show)</div>
                <div className={`text-[20px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats?.noShowRate || 0}%</div>
              </div>
              <button onClick={() => onNavigate('insights')} className={`text-[13px] font-bold transition-colors mt-1 ${isDarkMode ? 'text-[#a5b4fc] hover:text-white' : 'text-[#5469d4] hover:text-[#1a1f36]'}`}>
                Ver IA Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TU RESUMEN Section */}
      <div className="mt-16">
        <h2 className={`text-[20px] font-bold tracking-tight mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Tu resumen</h2>

        <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6 transition-colors ${isDarkMode ? 'border-[#1f2937]' : 'border-[#e3e8ee]'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-medium mr-1 ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>Intervalo de fechas</span>
            <div ref={resumenPeriodMenuRef} className="relative">
              <button
                onClick={() => setIsResumenPeriodMenuOpen(!isResumenPeriodMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent rounded border border-transparent transition-colors dark:text-[#a5b4fc] ${isDarkMode ? 'hover:text-[#818cf8]' : 'hover:text-[#1a1f36]'}`}
              >
                {activeResumenPeriod} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isResumenPeriodMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isResumenPeriodMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                  {['Hoy', 'Últimos 7 días', 'Este mes', 'Este año', 'Período personalizado'].map(p => (
                    <button key={p} onClick={() => { setActiveResumenPeriod(p); setIsResumenPeriodMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={diarioMenuRef} className="relative">
              <button
                onClick={() => setIsDiarioMenuOpen(!isDiarioMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent rounded border border-transparent transition-colors dark:text-[#a5b4fc] ${isDarkMode ? 'hover:text-[#818cf8]' : 'hover:text-[#1a1f36]'}`}
              >
                {activeDiarioPeriod} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDiarioMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDiarioMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-32 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                  {['Resumen', 'Diario', 'Detallado'].map(p => (
                    <button key={p} onClick={() => { setActiveDiarioPeriod(p); setIsDiarioMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={`h-4 w-px mx-1 transition-colors ${isDarkMode ? 'bg-[#1f2937]' : 'bg-[#e3e8ee]'}`}></div>

            <div ref={compareMenuRef} className="relative">
              <button
                onClick={() => setIsCompareMenuOpen(!isCompareMenuOpen)}
                className={`flex items-center gap-1.5 px-2 py-1 text-[13px] font-medium transition-colors ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-[#1a1f36]'} ${isCompareActive ? 'text-[#5469d4]' : (isDarkMode ? 'text-gray-500' : 'text-[#4f566b]')}`}
              >
                <X className={`w-3.5 h-3.5 transition-transform ${isCompareActive ? 'text-[#5469d4]' : 'text-[#8792a2] rotate-45'}`} />
                Compara
              </button>
              {isCompareMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                  <button onClick={() => { setIsCompareActive(true); setIsCompareMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>Activar comparación</button>
                  <button onClick={() => { setIsCompareActive(false); setIsCompareMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>Desactivar</button>
                </div>
              )}
            </div>

            <div ref={prevPeriodMenuRef} className="relative">
              <button
                onClick={() => setIsPrevPeriodMenuOpen(!isPrevPeriodMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent rounded border border-transparent transition-colors dark:text-[#a5b4fc] ${isDarkMode ? 'hover:text-[#818cf8]' : 'hover:text-[#1a1f36]'}`}
              >
                {activePrevPeriod} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPrevPeriodMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPrevPeriodMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                  {['Período anterior', 'Año anterior', 'Personalizado'].map(p => (
                    <button key={p} onClick={() => { setActivePrevPeriod(p); setIsPrevPeriodMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div ref={toolbarAddRef} className="relative">
              <button
                onClick={() => setIsToolbarAddOpen(!isToolbarAddOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold transition-colors border rounded-[6px] shadow-sm ${isDarkMode ? 'bg-[#1f2937] border-[#374151] text-white hover:border-[#4b5563]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:border-[#c1c9d2]'}`}
              >
                <Plus className="w-3.5 h-3.5 text-[#5469d4]" /> Añadir
              </button>
              {isToolbarAddOpen && (
                <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                  <button onClick={() => { setIsToolbarAddOpen(false); onNavigate('pacientes'); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Users className="w-4 h-4" /> Nuevo Paciente
                  </button>
                  <button onClick={() => { setIsToolbarAddOpen(false); onNavigate('agenda'); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Grid className="w-4 h-4" /> Nueva Cita
                  </button>
                  <div className={`my-1 border-t ${isDarkMode ? 'border-[#374151]' : 'border-gray-100'}`}></div>
                  <button onClick={() => { setIsToolbarAddOpen(false); onNavigate('tratamientos'); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Package className="w-4 h-4" /> Nuevo Servicio
                  </button>
                </div>
              )}
            </div>
            <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold transition-colors border rounded-[6px] shadow-sm ${isDarkMode ? 'bg-[#1f2937] border-[#374151] text-white hover:border-[#4b5563]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:border-[#c1c9d2]'}`}>
              <Settings className="w-3.5 h-3.5 text-[#5469d4] opacity-80" /> Editar
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 gap-0 border rounded-[8px] overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          <div className={`p-5 border-r flex flex-col h-[280px] transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className="flex items-center justify-between gap-1 mb-4">
              <div className={`flex items-center gap-1 text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>
                Facturación <Info className="w-3.5 h-3.5 text-[#8792a2]" />
              </div>
            </div>
            <div className={`flex-1 flex flex-col items-center justify-center`}>
              <span className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                {stats?.monthlyRevenue ? formatCurrency(stats.monthlyRevenue) : '0,00 €'}
              </span>
              <span className={`text-[12px] mt-1 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Este mes</span>
            </div>
          </div>

          {currentSpecialtyConfig.kpis.map((kpi: any, idx: number) => (
            <div key={idx} className={`p-5 border-r flex flex-col h-[280px] transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <div className="flex items-center justify-between gap-1 mb-4">
                <div className={`flex items-center gap-1 text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>
                  {kpi.label} <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                </div>
              </div>
              <div className={`flex-1 flex flex-col items-center justify-center`}>
                <div className="flex items-baseline gap-1">
                  <span className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                    {kpi.prefix}{Math.floor(Math.random() * 80) + 20}{kpi.suffix}
                  </span>
                </div>
                <span className={`text-[12px] mt-1 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Métrica {clinicConfig.specialty}</span>
              </div>
            </div>
          ))}

          {!currentSpecialtyConfig.kpis.length && (
            <>
              <div className={`p-5 border-r flex flex-col h-[280px] transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className={`flex items-center gap-1 text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>
                    Citas <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <span className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats?.appointmentsThisWeek || 0}</span>
                  <span className="text-[12px] mt-1 font-medium text-gray-400">Esta semana</span>
                </div>
              </div>
              <div className={`p-5 flex flex-col h-[280px] transition-colors ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className={`flex items-center gap-1 text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>
                    Pacientes Activos <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <span className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats?.activePatients || 0}</span>
                  <span className="text-[12px] mt-1 font-medium text-gray-400">Total</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ACTIVIDAD RECIENTE Section */}
      <div className="mt-12">
        <h2 className={`text-[16px] font-bold tracking-tight mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Agenda del Día</h2>
        <div className={`border rounded-[8px] overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b transition-colors ${isDarkMode ? 'border-gray-800 bg-[#0f172a]' : 'border-[#e3e8ee] bg-[#f6f9fc]'}`}>
                  <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider w-[100px] dark:text-gray-500">Hora</th>
                  <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider dark:text-gray-500">Paciente</th>
                  <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider dark:text-gray-500">Tratamiento</th>
                  <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider text-right dark:text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y transition-colors divide-gray-200 dark:divide-gray-800">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-[#4f566b] dark:text-gray-500">No hay citas el día de hoy</td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id} className={`transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`} onClick={() => onNavigate('agenda')}>
                      <td className={`px-4 py-3 text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{apt.startTime}</td>
                      <td className={`px-4 py-3 text-[13px] ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>{apt.patientName}</td>
                      <td className={`px-4 py-3 text-[13px] ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>{apt.type}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium ${
                          apt.status === 'CONFIRMED' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#e3f2fd] text-[#0d47a1]') :
                          apt.status === 'IN-PROGRESS' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-[#e8f5e9] text-[#1b5e20]') :
                          (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-[#fff3e0] text-[#e65100]')
                        }`}>
                          {apt.status === 'CONFIRMED' ? 'Confirmada' : apt.status === 'IN-PROGRESS' ? 'En sala' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
