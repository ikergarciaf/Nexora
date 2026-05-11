import React, { lazy, Suspense, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, Package, CreditCard, FileText, BarChart,
  Code, Search, Grid, HelpCircle, Bell, Settings, Plus, ChevronDown, CheckCircle2, Info, X, Map, User, LogOut, ArrowRight, Menu, Phone, Sun, Moon, Brain, Clock, Sparkles, Stethoscope, Loader2,
  Globe, Send
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useStaffData } from '../hooks/useStaffData';
import { NexoraLogo } from '../components/NexoraLogo';
import OnboardingTour from '../components/OnboardingTour';
import { SPECIALTY_MAP } from '../constants/specialtyMap';

const HomeView = lazy(() => import('./dashboard/HomeView'));
const AgendaView = lazy(() => import('./dashboard/AgendaView'));
const PatientsView = lazy(() => import('./dashboard/PatientsView'));
const ClinicalHistoryView = lazy(() => import('./dashboard/ClinicalHistoryView'));
const SpecialtyModuleView = lazy(() => import('./dashboard/SpecialtyModuleView'));
const TreatmentsView = lazy(() => import('./dashboard/TreatmentsView'));
const BillingView = lazy(() => import('./dashboard/BillingView'));
const AnalyticsView = lazy(() => import('./dashboard/AnalyticsView'));
const InsightsView = lazy(() => import('./dashboard/InsightsView'));
const StaffView = lazy(() => import('./dashboard/StaffView'));
const AutomationsView = lazy(() => import('./dashboard/AutomationsView'));
const ConfigView = lazy(() => import('./dashboard/ConfigView'));
const WhatsAppBotView = lazy(() => import('./dashboard/WhatsAppBotView'));
const ConsentView = lazy(() => import('./dashboard/ConsentView'));
const InventoryView = lazy(() => import('./dashboard/InventoryView'));
const CampaignsView = lazy(() => import('./dashboard/CampaignsView'));

function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-[#008477]" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats, appointments, patients, tenantConfig, refreshData } = useDashboardData();
  const { users, rooms, shifts, refreshStaffData } = useStaffData();

  const [activeView, setActiveView] = useState('inicio');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNexoraAiOpen, setIsNexoraAiOpen] = useState(false);
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const defaultOpeningHours = [
    { day: 'Lunes', open: '09:00', close: '20:00', closed: false },
    { day: 'Martes', open: '09:00', close: '20:00', closed: false },
    { day: 'Miércoles', open: '09:00', close: '20:00', closed: false },
    { day: 'Jueves', open: '09:00', close: '20:00', closed: false },
    { day: 'Viernes', open: '09:00', close: '20:00', closed: false },
    { day: 'Sábado', open: '10:00', close: '14:00', closed: false },
    { day: 'Domingo', open: '00:00', close: '00:00', closed: true },
  ];

  const [clinicConfig, setClinicConfig] = useState(() => ({
    name: 'Tu Clínica',
    slug: '',
    plan: 'Pro',
    specialty: 'Odontología',
    owner: 'Iker',
    email: 'ikergarciafdez1@gmail.com',
    address: 'Calle Principal 123, Madrid',
    phone: '+34 600 000 000',
    description: '',
    themeColor: '#008477',
    logoUrl: '',
    contactPhone: '',
    contactEmail: '',
    aiEnabled: true,
    autoSummaries: false,
    publicBookingEnabled: false,
    locale: 'es',
    appointmentInterval: 30,
    openingHours: (() => {
      try { return JSON.parse(localStorage.getItem('clinic-hours') || 'null') || defaultOpeningHours; }
      catch { return defaultOpeningHours; }
    })(),
  }));

  useEffect(() => {
    if (tenantConfig) {
      setClinicConfig(prev => ({ ...prev, ...tenantConfig }));
    }
  }, [tenantConfig]);

  const updateClinicConfig = useCallback((newConfig: Partial<typeof clinicConfig>) => {
    setClinicConfig(prev => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.name) localStorage.setItem('clinic-name', newConfig.name);
      if (newConfig.plan) localStorage.setItem('clinic-plan', newConfig.plan);
      if (newConfig.specialty) localStorage.setItem('clinic-specialty', newConfig.specialty);
      if (newConfig.openingHours) localStorage.setItem('clinic-hours', JSON.stringify(newConfig.openingHours));
      return updated;
    });
  }, []);

  const userInfo = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user_info') || '{}'); } catch { return {}; }
  }, []);

  const userInitials = useMemo(() => {
    const name = userInfo?.name || clinicConfig.owner || 'U';
    return name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
  }, [userInfo, clinicConfig.owner]);

  const currentSpecialtyConfig = useMemo(() => {
    return SPECIALTY_MAP[clinicConfig.specialty] || SPECIALTY_MAP['Medicina General'];
  }, [clinicConfig.specialty]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specialtyParam = params.get('specialty');
    if (specialtyParam) {
      const specialtyMap: Record<string, string> = {
        dental: 'Odontología',
        nutricion: 'Nutrición',
        fisioterapia: 'Fisioterapia',
        psicologos: 'Psicología',
        estetica: 'Estética',
        general: 'Medicina General',
      };
      const mappedSpecialty = specialtyMap[specialtyParam];
      if (mappedSpecialty) {
        updateClinicConfig({ specialty: mappedSpecialty });
      }
    }
    if (params.get('purchase') === 'success') {
      showToast('Pago completado con éxito. ¡Bienvenido a Nexora!', 'success');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [location.search, updateClinicConfig]);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const globalAddRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('clinic-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('clinic-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    refreshStaffData();
  }, [refreshStaffData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (globalAddRef.current && !globalAddRef.current.contains(event.target as Node)) {
        setIsGlobalAddOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = useCallback((view: string) => {
    setActiveView(view);
    setIsSidebarOpen(false);
    setIsGlobalAddOpen(false);
  }, []);

  const handleNavigate = useCallback((view: string) => {
    setActiveView(view);
  }, []);

  const renderView = () => {
    const specializedView = currentSpecialtyConfig.specializedItems.find((item: any) => item.id === activeView);
    if (specializedView) {
      return (
        <Suspense fallback={<ViewLoader />}>
          <SpecialtyModuleView
            isDarkMode={isDarkMode}
            activeView={activeView}
            clinicConfig={clinicConfig}
            onNavigate={handleNavigate}
          />
        </Suspense>
      );
    }

    switch (activeView) {
      case 'inicio':
        return (
          <Suspense fallback={<ViewLoader />}>
            <HomeView isDarkMode={isDarkMode} onNavigate={handleNavigate} clinicConfig={clinicConfig} currentSpecialtyConfig={currentSpecialtyConfig} />
          </Suspense>
        );
      case 'agenda':
        return (
          <Suspense fallback={<ViewLoader />}>
            <AgendaView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'pacientes':
        return (
          <Suspense fallback={<ViewLoader />}>
            <PatientsView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'historial_clinico':
        return (
          <Suspense fallback={<ViewLoader />}>
            <ClinicalHistoryView isDarkMode={isDarkMode} clinicConfig={clinicConfig} onNavigate={handleNavigate} onBack={() => setActiveView('pacientes')} />
          </Suspense>
        );
      case 'tratamientos':
        return (
          <Suspense fallback={<ViewLoader />}>
            <TreatmentsView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'facturación':
        return (
          <Suspense fallback={<ViewLoader />}>
            <BillingView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'análisis':
        return (
          <Suspense fallback={<ViewLoader />}>
            <AnalyticsView isDarkMode={isDarkMode} />
          </Suspense>
        );
      case 'insights':
        return (
          <Suspense fallback={<ViewLoader />}>
            <InsightsView isDarkMode={isDarkMode} />
          </Suspense>
        );
      case 'staff':
        return (
          <Suspense fallback={<ViewLoader />}>
            <StaffView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'automatizaciones':
        return (
          <Suspense fallback={<ViewLoader />}>
            <AutomationsView isDarkMode={isDarkMode} />
          </Suspense>
        );
      case 'configuracion':
        return (
          <Suspense fallback={<ViewLoader />}>
            <ConfigView isDarkMode={isDarkMode} onNavigate={handleNavigate} clinicConfig={clinicConfig} onUpdateConfig={updateClinicConfig} tenantConfig={tenantConfig} />
          </Suspense>
        );
      case 'whatsapp_bot':
        return (
          <Suspense fallback={<ViewLoader />}>
            <WhatsAppBotView isDarkMode={isDarkMode} clinicConfig={clinicConfig} />
          </Suspense>
        );
      case 'consentimientos':
        return (
          <Suspense fallback={<ViewLoader />}>
            <ConsentView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'inventario':
        return (
          <Suspense fallback={<ViewLoader />}>
            <InventoryView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'campanas':
        return (
          <Suspense fallback={<ViewLoader />}>
            <CampaignsView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<ViewLoader />}>
            <HomeView isDarkMode={isDarkMode} onNavigate={handleNavigate} clinicConfig={clinicConfig} currentSpecialtyConfig={currentSpecialtyConfig} />
          </Suspense>
        );
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] text-[#f8fafc] dark' : 'bg-[#f6f9fc] text-[#425466]'}`}>
      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
        )}

        <aside className={`fixed md:static inset-y-0 left-0 w-64 border-r flex flex-col shrink-0 z-[60] transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isDarkMode ? 'bg-[#0f172a] border-[#1f2937]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          <div ref={accountMenuRef} className={`p-4 pt-5 relative z-20 transition-colors ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f6f9fc]'}`}>
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className={`w-[calc(100%-16px)] mx-2 mt-4 mb-2 flex items-center justify-between px-2 py-1.5 rounded-[6px] border transition-all ${isAccountMenuOpen ? (isDarkMode ? 'bg-[#1e293b] border-transparent' : 'bg-[#e3e8ee] border-transparent') : (isDarkMode ? 'bg-transparent border-transparent hover:bg-[#1e293b]' : 'bg-transparent border-transparent hover:bg-[#e3e8ee]')}`}
            >
              <div className="flex items-center gap-2 text-left overflow-hidden">
                <NexoraLogo size={24} color={currentSpecialtyConfig.primaryColor} />
                <div className="min-w-0">
                  <div className={`text-[13px] font-bold leading-tight truncate ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                    {clinicConfig.name}
                  </div>
                  <div className={`text-[12px] leading-tight mt-0.5 truncate ${isDarkMode ? 'text-gray-500 font-bold' : 'text-[#4f566b] font-medium'}`}>
                    {clinicConfig.specialty}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8792a2] shrink-0" />
            </button>

            {isAccountMenuOpen && (
              <div className={`absolute top-[86px] left-3 w-[260px] rounded-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col z-[100] py-2 border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                <div className="px-5 py-4 pb-2 flex flex-col items-center">
                  <NexoraLogo size={48} className="mb-3" color={currentSpecialtyConfig.primaryColor} />
                  <div className={`text-[15px] font-bold text-center w-full truncate ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                    {currentSpecialtyConfig.productName}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded mt-2 mb-4 bg-gray-500/10 text-gray-500">
                    Modo {clinicConfig.specialty}
                  </div>
                </div>
                <div className={`py-1 border-t ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
                  <button
                    onClick={() => { setActiveView('configuracion'); setIsAccountMenuOpen(false); }}
                    className={`w-full text-left px-5 py-2.5 flex items-center gap-3 text-[13px] font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}
                  >
                    <Settings className="w-[16px] h-[16px]" /> Configuración
                  </button>
                  <button className={`w-full text-left px-5 py-2.5 flex items-center justify-between text-[13px] font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                    <div className="flex items-center gap-3">
                      <Package className="w-[16px] h-[16px] text-amber-500" /> Cambiar plan
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-30" />
                  </button>
                </div>
                <div className={`py-1 border-t transition-colors ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
                  <div className={`w-full text-left px-5 py-2.5 flex items-center justify-between text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#008477] text-white flex items-center justify-center text-[10px]">I</div>
                      {clinicConfig.owner}
                    </div>
                    <Info className="w-[14px] h-[14px] opacity-30" />
                  </div>
                  <button
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    className="w-full text-left px-5 py-2.5 flex items-center gap-3 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-[16px] h-[16px]" /> Cerrar sesión
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full text-left px-5 py-2.5 flex items-center gap-3 text-[13px] font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRight className="w-[16px] h-[16px]" /> Salir a web principal
                  </button>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 space-y-0.5 mt-2 overflow-y-auto pb-4">
            <button
              onClick={() => handleMenuClick('inicio')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-[4px] font-semibold text-[13px] transition-colors ${activeView === 'inicio' ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
            >
              <Home className={`w-4 h-4 ${activeView === 'inicio' ? (isDarkMode ? 'text-blue-400' : currentSpecialtyConfig.accentColor) : 'text-[#8792a2]'}`} />
              Inicio
            </button>

            {currentSpecialtyConfig.specializedItems.length > 0 && (
              <>
                <div className={`mt-6 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Herramientas {clinicConfig.specialty}</div>
                {currentSpecialtyConfig.specializedItems.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${activeView === item.id ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${activeView === item.id ? currentSpecialtyConfig.accentColor : 'text-[#8792a2]'}`}>{item.icon}</div>
                      {item.label}
                    </div>
                  </button>
                ))}
              </>
            )}

            <div className={`mt-6 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Gestión Principal</div>
            {[
              { id: 'agenda', label: 'Agenda', icon: Grid },
              { id: 'pacientes', label: 'Clientes / Pacientes', icon: Users },
              { id: 'tratamientos', label: 'Servicios', icon: Package },
              { id: 'staff', label: 'Personal y Turnos', icon: User },
              { id: 'consentimientos', label: 'Consentimientos', icon: FileText },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${(activeView === item.id || (item.id === 'pacientes' && activeView === 'historial_clinico')) ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${activeView === item.id || (item.id === 'pacientes' && activeView === 'historial_clinico') ? (isDarkMode ? 'text-blue-400' : 'text-[#5469d4]') : 'text-[#8792a2]'}`} />
                  {item.label}
                </div>
              </button>
            ))}

            <div className={`mt-8 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Negocio</div>
            {[
              { id: 'facturación', label: 'Facturación', icon: CreditCard },
              { id: 'análisis', label: 'Análisis', icon: BarChart },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${activeView === item.id ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${activeView === item.id ? (isDarkMode ? 'text-blue-400' : 'text-[#5469d4]') : 'text-[#8792a2]'}`} />
                  {item.label}
                </div>
              </button>
            ))}

            <div className={`mt-8 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Plataforma</div>
            {[
              { id: 'whatsapp_bot', label: 'WhatsApp Bot', icon: Phone },
              { id: 'inventario', label: 'Inventario', icon: Package },
              { id: 'campanas', label: 'Email Marketing', icon: Send },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${activeView === item.id ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${activeView === item.id ? (isDarkMode ? 'text-blue-400' : 'text-[#5469d4]') : 'text-[#8792a2]'}`} />
                  {item.label}
                </div>
              </button>
            ))}
            <a
              href="/soluciones/web-clinicas"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#8792a2]" />
                Desarrollo Web
              </div>
            </a>
            <button
              onClick={() => setIsNexoraAiOpen(!isNexoraAiOpen)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'} ${isNexoraAiOpen ? (isDarkMode ? 'text-white' : 'text-[#1a1f36]') : ''}`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-[#8792a2]" />
                Inteligencia {currentSpecialtyConfig.productName}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8792a2] transition-transform ${isNexoraAiOpen ? 'rotate-180' : ''}`} />
            </button>

            {isNexoraAiOpen && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {[
                  { id: 'automatizaciones', label: 'Automatizaciones' },
                  { id: 'insights', label: 'Insights Avanzados' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 pl-10 rounded-[4px] font-medium text-[13px] transition-colors ${activeView === item.id ? (isDarkMode ? 'bg-[#334155] text-white border-l-2 border-blue-400' : 'bg-[#e3e8ee] text-[#1a1f36] border-l-2 border-[#5469d4]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </nav>

          <div className="p-4 mt-auto">
            <a href="/api/health" target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-between px-2 py-1.5 font-medium text-[13px] transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-[#425466] hover:text-[#1a1f36]'}`}>
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-[#8792a2]" />
                API Status
              </div>
            </a>
          </div>
        </aside>

        <main className={`flex-1 overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.02)] relative z-10 transition-colors ${isDarkMode ? 'bg-[#111827]' : 'bg-white'}`}>
          <header className={`flex items-center justify-between px-4 md:px-8 py-4 border-b sticky top-0 z-30 transition-colors ${isDarkMode ? 'bg-[#111827] border-[#1f2937]' : 'bg-white border-[#e3e8ee] md:border-b-0'}`}>
            <div className="flex items-center gap-3 flex-1 md:flex-none">
              <button
                className={`md:hidden p-2 -ml-2 rounded-[4px] transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#1f2937]' : 'text-[#4f566b] hover:bg-[#f6f9fc]'}`}
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
              </button>

              <div className={`hidden md:flex items-center gap-3 border rounded-[4px] px-3 py-1.5 w-80 text-[13px] font-medium transition-colors focus-within:ring-1 ${isDarkMode ? 'bg-[#1f2937] border-[#374151] text-white focus-within:border-blue-500 focus-within:ring-blue-500' : 'bg-[#f6f9fc] border-[#e3e8ee] focus-within:border-[#5469d4] focus-within:ring-[#5469d4]'}`}>
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`} />
                <input type="text" placeholder="Buscar clientes o citas..." onFocus={() => handleMenuClick('pacientes')} className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
              </div>
            </div>

            <div className={`flex items-center gap-3 md:gap-4 ${isDarkMode ? 'text-[#94a3b8]' : 'text-[#4f566b]'}`}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-all hover:scale-110 ${isDarkMode ? 'bg-[#1f2937] text-yellow-400' : 'bg-[#f1f5f9] text-[#5469d4]'}`}
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Search className={`w-[18px] h-[18px] cursor-pointer md:hidden ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              <Grid className={`w-[18px] h-[18px] cursor-pointer hidden sm:block ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              <HelpCircle className={`w-[18px] h-[18px] cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              <Bell className={`w-[18px] h-[18px] cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              <Settings className={`w-[18px] h-[18px] cursor-pointer hidden sm:block ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />

              <div ref={globalAddRef} className="relative">
                <div
                  onClick={() => setIsGlobalAddOpen(!isGlobalAddOpen)}
                  className={`hidden md:flex w-[28px] h-[28px] ${currentSpecialtyConfig.secondaryColor} text-white rounded-full items-center justify-center cursor-pointer shadow-sm hover:opacity-90 ml-1`}
                >
                  <Plus className={`w-4 h-4 transition-transform ${isGlobalAddOpen ? 'rotate-45' : ''}`} />
                </div>
                {isGlobalAddOpen && (
                  <div className={`absolute top-full right-0 mt-3 w-48 rounded-lg shadow-xl border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                    <button onClick={() => { setIsGlobalAddOpen(false); setActiveView('pacientes'); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Users className="w-4 h-4" /> Nuevo Paciente
                    </button>
                    <button onClick={() => { setIsGlobalAddOpen(false); setActiveView('agenda'); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Grid className="w-4 h-4" /> Nueva Cita
                    </button>
                    <div className={`my-1 border-t ${isDarkMode ? 'border-[#374151]' : 'border-gray-100'}`}></div>
                    <button onClick={() => { setIsGlobalAddOpen(false); setActiveView('tratamientos'); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Package className="w-4 h-4" /> Nuevo Servicio
                    </button>
                  </div>
                )}
              </div>

              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`ml-2 w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm cursor-pointer border-2 transition-all hover:scale-105 ${
                    isDarkMode
                      ? 'bg-[#334155] text-white border-[#475569] hover:border-blue-400'
                      : 'bg-[#1a1f36] text-white border-[#e3e8ee] hover:border-[#5469d4]'
                  }`}
                >
                  {userInitials}
                </button>
                {isUserMenuOpen && (
                  <div className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-xl border z-50 py-2 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                    <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
                      <div className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{userInfo?.name || clinicConfig.owner}</div>
                      <div className={`text-[12px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{userInfo?.email || clinicConfig.email}</div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { navigate('/tenants'); setIsUserMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-3 transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                        <Grid className="w-4 h-4" /> Cambiar de clínica
                      </button>
                      <button onClick={() => { setActiveView('configuracion'); setIsUserMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-3 transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                        <Settings className="w-4 h-4" /> Configuración
                      </button>
                      <button onClick={() => { navigate('/pricing'); setIsUserMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-3 transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                        <Package className="w-4 h-4" /> Plan y facturación
                      </button>
                    </div>
                    <div className={`py-1 border-t ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
                      <button
                        onClick={() => { localStorage.clear(); navigate('/login'); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors`}
                      >
                        <LogOut className="w-4 h-4" /> Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {renderView()}

        </main>
      </div>

      <OnboardingTour />

      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${toast.type === 'success' ? 'bg-[#1b4d3e] text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-white" />}
          <span className="text-[14px] font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
