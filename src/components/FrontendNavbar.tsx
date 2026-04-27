import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { NexoraLogo } from './NexoraLogo';

const SPECIALTIES = [
  { label: 'Clínicas dentales', slug: 'dental' },
  { label: 'Fisioterapia', slug: 'fisioterapia' },
  { label: 'Psicología', slug: 'psicologos' },
  { label: 'Nutrición', slug: 'nutricion' },
  { label: 'Medicina estética', slug: 'estetica' },
  { label: 'Policlínica general', slug: 'general' },
  { label: 'App para pacientes', slug: 'app-clientes' },
];

export const FrontendNavbar = ({ brandName }: { brandName?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const goToHash = (hash: string) => {
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-colors duration-200 ${
        scrolled || mobileOpen
          ? 'bg-white/90 backdrop-blur border-b border-slate-200/70'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group"
          aria-label="Ir al inicio"
        >
          <NexoraLogo size={28} />
          <span className="font-semibold text-[17px] tracking-tight text-slate-900">
            {brandName || 'Nexora'}
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown(true)}
            onMouseLeave={() => setOpenDropdown(false)}
          >
            <button
              className="flex items-center gap-1 px-3 h-10 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => setOpenDropdown((v) => !v)}
            >
              Especialidades
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openDropdown ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {openDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 pt-2"
                >
                  <div className="w-64 bg-white rounded-xl shadow-lg ring-1 ring-slate-200/70 py-2">
                    {SPECIALTIES.map((s) => (
                      <button
                        key={s.slug}
                        onClick={() => navigate(`/soluciones/${s.slug}`)}
                        className="w-full text-left px-4 py-2 text-[14px] text-slate-600 hover:text-[#008477] hover:bg-slate-50 transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => goToHash('precios')}
            className="px-3 h-10 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Precios
          </button>
          <button
            onClick={() => goToHash('faq')}
            className="px-3 h-10 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Preguntas
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:inline-flex h-10 px-3 items-center text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:inline-flex h-10 px-4 items-center rounded-lg bg-slate-900 text-white text-[14px] font-medium hover:bg-[#008477] transition-colors"
          >
            Empezar gratis
          </button>
          <button
            className="lg:hidden p-2 text-slate-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  Especialidades
                </p>
                <div className="grid gap-1">
                  {SPECIALTIES.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => navigate(`/soluciones/${s.slug}`)}
                      className="text-left py-2 text-[15px] text-slate-700 hover:text-[#008477]"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-1 border-t border-slate-100 pt-4">
                <button
                  onClick={() => goToHash('precios')}
                  className="text-left py-2 text-[15px] text-slate-700"
                >
                  Precios
                </button>
                <button
                  onClick={() => goToHash('faq')}
                  className="text-left py-2 text-[15px] text-slate-700"
                >
                  Preguntas frecuentes
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-left py-2 text-[15px] text-slate-700"
                >
                  Iniciar sesión
                </button>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full h-12 rounded-lg bg-slate-900 text-white font-medium"
              >
                Empezar gratis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
