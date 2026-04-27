import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, Menu, X, ArrowRight, Brain, Calendar, 
  Users2, BarChart3, Star, Monitor, Smartphone, Globe
} from 'lucide-react';
import { NexoraLogo } from './NexoraLogo';

export const FrontendNavbar = ({ brandName }: { brandName?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (path: string, hash?: string) => {
    if (location.pathname === '/' && hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    if (hash) {
      navigate('/' + hash);
      // Setup a small timeout to let the page load before scrolling
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const services = [
    { label: 'Software Clínica Dental', slug: 'dental' },
    { label: 'Software Nutrición', slug: 'nutricion' },
    { label: 'Software Fisioterapia', slug: 'fisioterapia' },
    { label: 'Software Psicólogos', slug: 'psicologos' },
    { label: 'Software Estética', slug: 'estetica' },
    { label: 'Gestión Médica General', slug: 'general' },
    { label: 'App para Clientes', slug: 'app-clientes' }
  ];

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNavClick('/')}>
            <NexoraLogo size={36} />
            <span className="font-black text-xl tracking-tight text-[#1a1f36]">{brandName || 'Nexora'}</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {/* Servicios Dropdown */}
            <div 
              className="relative group py-2"
              onMouseEnter={() => setActiveDropdown('servicios')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="flex items-center gap-1 text-[14px] font-bold text-[#4f566b] hover:text-[#008477] transition-colors cursor-pointer">
                Especialidades <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'servicios' ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {activeDropdown === 'servicios' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-[260px] bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-[110]"
                  >
                    {services.map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => navigate(`/soluciones/${item.slug}`)}
                        className="px-5 py-2.5 hover:bg-emerald-50 text-[13px] font-bold text-slate-600 hover:text-[#008477] transition-colors cursor-pointer"
                      >
                        {item.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Soluciones Dropdown */}
            <div 
              className="relative group py-2"
              onMouseEnter={() => setActiveDropdown('soluciones')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="flex items-center gap-1 text-[14px] font-bold text-[#4f566b] hover:text-[#008477] transition-colors cursor-pointer" onClick={() => handleNavClick('/', '#demo')}>
                Funciones <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'soluciones' ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {activeDropdown === 'soluciones' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-[240px] bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-[110]"
                  >
                    {['Agenda Digital', 'Historial Clínico', 'Facturación', 'Nexora AI'].map((label, i) => (
                      <div key={i} onClick={() => handleNavClick('/', '#demo')} className="px-5 py-2.5 hover:bg-emerald-50 text-[13px] font-bold text-slate-600 hover:text-[#008477] transition-colors cursor-pointer">
                        {label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={() => handleNavClick('/', '#precios')}
              className="text-[14px] font-bold text-[#4f566b] hover:text-[#008477] transition-colors cursor-pointer"
            >
              Precios
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="hidden md:block text-[14px] font-bold text-slate-700 hover:text-[#008477] transition-colors"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-[#1a1f36] hover:bg-[#008477] text-white text-[14px] font-bold rounded-lg transition-all shadow-md active:scale-95"
            >
              Probar Gratis
            </button>
            
            <button 
              className="lg:hidden p-2 text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden bg-white border-b border-gray-100 overflow-hidden shadow-2xl absolute top-full inset-x-0"
                >
                  <div className="px-6 py-8 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                      <p className="text-xs font-black uppercase tracking-widest text-[#008477]">Especialidades</p>
                      <div className="grid grid-cols-1 gap-3">
                        {services.map((item, i) => (
                          <div 
                            key={i} 
                            onClick={() => navigate(`/soluciones/${item.slug}`)}
                            className="text-[15px] font-bold text-slate-700 hover:text-[#008477] py-1 border-b border-gray-50"
                          >
                            {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                  <p className="text-[15px] font-bold text-slate-700 py-1 border-b border-gray-50" onClick={() => handleNavClick('/', '#precios')}>Precios</p>
                  <p className="text-[15px] font-bold text-slate-700 py-1 border-b border-gray-50" onClick={() => handleNavClick('/', '#demo')}>Funciones</p>
                  <p className="text-[15px] font-bold text-slate-700 py-1 border-b border-gray-50" onClick={() => navigate('/dashboard')}>Iniciar Sesión</p>
                </div>
                
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 bg-[#1a1f36] text-white font-black rounded-xl text-lg mt-4"
                >
                  Probar Gratis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
