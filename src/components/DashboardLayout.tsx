import React from 'react';
import { 
  Home, Calendar, Users, BarChart, Settings, LogOut, Search, Bell, Menu, X, ChevronDown, User, Wallet
} from 'lucide-react';
import { NexoraLogo } from './NexoraLogo';
import { motion } from 'motion/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeView,
  onViewChange,
  isDarkMode,
  onThemeToggle
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'facturacion', label: 'Facturación', icon: Wallet },
    { id: 'reportes', label: 'Reportes', icon: BarChart },
    { id: 'nexora_ai', label: 'Nexora AI', icon: NexoraLogo },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className={`fixed lg:relative w-72 h-screen border-r transition-all duration-300 z-[100] ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-slate-700">
          <NexoraLogo size={32} />
          <div>
            <div className="font-bold text-lg text-[#008477]">Nexora</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Medical SaaS</div>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id
                  ? 'bg-[#008477] text-white shadow-lg shadow-[#008477]/20 scale-[1.02]'
                  : isDarkMode 
                    ? 'text-gray-400 hover:bg-slate-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#008477]'
              }`}
            >
              {item.id === 'nexora_ai' ? (
                <item.icon size={20} color={activeView === item.id ? 'white' : '#008477'} />
              ) : (
                <item.icon size={20} />
              )}
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-semibold text-sm">
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header */}
        <header className={`h-16 flex items-center justify-between px-6 border-b z-40 ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border max-w-md ${
              isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-100'
            }`}>
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar pacientes..." 
                className="bg-transparent border-none outline-none text-sm w-48 md:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onThemeToggle}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button className={`p-2 rounded-lg relative transition-colors ${
              isDarkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
            }`}>
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>

            <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700 mx-1"></div>

            <div className="relative">
              <button 
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#008477] to-emerald-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-offset-2 ring-emerald-500/20">
                  IG
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {isAccountMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsAccountMenuOpen(false)}></div>
                  <div className={`absolute right-0 mt-3 w-56 rounded-xl shadow-2xl py-2 z-40 border border-gray-100 dark:border-slate-600 ${
                    isDarkMode ? 'bg-slate-800' : 'bg-white'
                  }`}>
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 mb-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Iker García</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ikergarciafdez1@gmail.com</p>
                    </div>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <User size={16} /> Ver Perfil
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <Settings size={16} /> Ajustes
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
