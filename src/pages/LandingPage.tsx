import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Brain, Calendar, CheckCircle2, Clock, MessageSquare, 
  Shield, Sparkles, Stethoscope, Zap, Layout, Database, Globe, 
  Check, Menu, X, ChevronRight, BarChart3, Users2, Star, ChevronDown, Monitor, Rocket, Info, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { NexoraLogo } from '../components/NexoraLogo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('agenda');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      id: 'agenda',
      title: "Agenda Inteligente",
      description: "Gestiona citas de forma visual y rápida. IA que predice inasistencias y optimiza huecos.",
      icon: <Calendar className="w-6 h-6 text-[#008477]" />
    },
    {
      id: 'pacientes',
      title: "Historial Clínico",
      description: "Fichas completas con LOPD, odontogramas y firma digital de documentos.",
      icon: <Users2 className="w-6 h-6 text-[#008477]" />
    },
    {
      id: 'facturacion',
      title: "Facturación y Cobros",
      description: "Emisión de facturas, presupuestos, cobros y liquidaciones en un clic.",
      icon: <BarChart3 className="w-6 h-6 text-[#008477]" />
    },
    {
      id: 'ia',
      title: "Inteligencia Artificial",
      description: "Notas automáticas y borradores de mensajes que ahorran horas de trabajo.",
      icon: <Brain className="w-6 h-6 text-[#008477]" />
    }
  ];

  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      name: "Starter",
      getPrice: (cycle: string) => cycle === 'monthly' ? "29" : "24",
      description: "La herramienta definitiva para profesionales independientes.",
      features: [
        "Citas ILIMITADAS",
        "Agenda Médica Inteligente",
        "Ficha paciente básica (RGPD)",
        "Recordatorios WhatsApp/Email",
        "Soporte vía Ticket",
        "Sincronización Google Calendar"
      ],
      cta: "Empezar gratis",
      popular: false
    },
    {
      name: "Pro",
      getPrice: (cycle: string) => cycle === 'monthly' ? "59" : "49",
      description: "Gestiona tu equipo y automatiza tareas con Inteligencia Artificial.",
      features: [
        "Todo lo de Starter",
        "Hasta 5 Empleados",
        "IA Generativa (Notas SOAP)",
        "Facturación y Presupuestos",
        "Arqueos de caja avanzados",
        "Soporte Prioritario"
      ],
      cta: "Prueba 14 días",
      popular: true
    },
    {
      name: "Elite",
      getPrice: (cycle: string) => cycle === 'monthly' ? "99" : "84",
      description: "Para centros de alto rendimiento y cadenas de clínicas.",
      features: [
        "Todo lo de Pro",
        "EMPLEADOS ILIMITADOS",
        "Multi-sede Incluido",
        "Dashboard BI y Analítica",
        "API para integraciones",
        "Account Manager dedicado"
      ],
      cta: "Contactar",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1f36] font-sans selection:bg-[#008477]/10 selection:text-[#008477]">
      
      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <NexoraLogo size={36} />
            <span className="font-bold text-xl tracking-tight text-[#1a1f36]">Nexora</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {/* Servicios Dropdown */}
            <div 
              className="relative group py-2"
              onMouseEnter={() => setActiveDropdown('servicios')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="flex items-center gap-1 text-[14px] font-semibold text-[#4f566b] hover:text-[#008477] transition-colors cursor-pointer">
                Servicios <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'servicios' ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {activeDropdown === 'servicios' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-[260px] bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-[110]"
                  >
                    {[
                      'Software Clínica Dental', 'Software Nutrición', 'Software Fisioterapia', 
                      'Software Psicólogos', 'Software Estética', 'Gestión Médica General',
                      'App para Clientes'
                    ].map((label, i) => (
                      <div key={i} className="px-5 py-2 hover:bg-gray-50 text-[13px] font-medium text-gray-500 hover:text-[#008477] transition-colors cursor-pointer">
                        {label}
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
              <div className="flex items-center gap-1 text-[14px] font-semibold text-[#4f566b] hover:text-[#008477] transition-colors cursor-pointer">
                Soluciones <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'soluciones' ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {activeDropdown === 'soluciones' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-[240px] bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-[110]"
                  >
                    {['Agenda Digital', 'Historial Clínico', 'Facturación', 'Nexora AI'].map((label, i) => (
                      <div key={i} className="px-5 py-2 hover:bg-gray-50 text-[13px] font-medium text-gray-500 hover:text-[#008477] transition-colors cursor-pointer">
                        {label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* A quien ayudamos Dropdown */}
            <div 
              className="relative group py-2"
              onMouseEnter={() => setActiveDropdown('ayudamos')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="flex items-center gap-1 text-[14px] font-semibold text-[#4f566b] hover:text-[#008477] transition-colors cursor-pointer">
                A quién ayudamos <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'ayudamos' ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {activeDropdown === 'ayudamos' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-[240px] bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-[110]"
                  >
                    {['Clínicas', 'Autónomos', 'Franquicias'].map((label, i) => (
                      <div key={i} className="px-5 py-2 hover:bg-gray-50 text-[13px] font-medium text-gray-500 hover:text-[#008477] transition-colors cursor-pointer">
                        {label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <a href="#precios" className="text-[14px] font-semibold text-[#4f566b] hover:text-[#008477] transition-colors">Precios</a>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="hidden md:block text-[14px] font-semibold text-[#4f566b] hover:text-[#008477] transition-colors"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-[#008477] hover:bg-[#006b60] text-white text-[14px] font-bold rounded-lg transition-all shadow-sm active:scale-95"
            >
              Probar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section: Replicated Style */}
      <section className="relative pt-32 lg:pt-52 pb-24 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#008477]/5 border border-[#008477]/10 rounded-full text-[#008477] text-[13px] font-bold"
            >
              <NexoraLogo size={16} /> Software médico 3.0
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-7xl font-bold tracking-tight text-[#1a1f36] leading-[1.1]"
            >
              El software médico que <span className="text-[#008477]">transforma tu tiempo</span> en resultados
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-[#4f566b] max-w-2xl leading-relaxed font-medium"
            >
              Sin instalaciones. Sin complicaciones. Todo lo que necesitas para gestionar tu consulta, facturar y cuidar a tus pacientes mientras ahorras un 40% de tu tiempo administrativo.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-10 py-4 bg-[#008477] hover:bg-[#006b60] text-white text-lg font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                Empezar 14 días gratis
              </button>
              <p className="text-sm text-[#8792a2] font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Sin tarjeta de crédito
              </p>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-4 pt-12"
            >
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  <span className="text-[#1a1f36] font-bold text-sm ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Confianza máxima de nuestros clientes</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Features: Minimalist Style */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Funcionalidades diseñadas por y para profesionales</h2>
            <p className="text-gray-500 font-medium leading-relaxed">Simplificamos la complejidad tecnológica para que te centres en lo que importa: tus pacientes.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#008477]/30 transition-all group">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Difference / Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight leading-tight">Nuestra diferencia: tecnología que entiende tu consulta.</h2>
              <div className="space-y-6">
                {[
                  { title: "Razonamiento Clínico Inteligente", desc: "IA que ayuda en la toma de decisiones clínicas y estructuración de datos." },
                  { title: "Acceso Universal Real", desc: "Multi-dispositivo sin límites. Gestiona desde tu móvil, tablet o PC sin apps pesadas." },
                  { title: "Soporte Humano 100%", desc: "Nada de bots. Un equipo experto te ayuda a migrar tus datos y configurar tu centro." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-[#008477] text-white flex items-center justify-center mt-1">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1a1f36]">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
                  alt="Interface Nexora" 
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Pricing Banner */}
      <section id="precios" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6 mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Precios diseñados para crecer contigo</h2>
            <p className="text-lg text-gray-500 font-medium">Únete a más de 500 clínicas que han ahorrado un 30% en costes tecnológicos al cambiarse a Nexora.</p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-[#1a1f36]' : 'text-gray-400'}`}>Mensual</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
              className="w-14 h-7 bg-gray-100 rounded-full p-1 relative flex items-center"
            >
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                className="w-5 h-5 bg-[#008477] rounded-full shadow-sm"
              />
            </button>
            <span className={`text-sm font-semibold transition-colors ${billingCycle === 'annually' ? 'text-[#1a1f36]' : 'text-gray-400'}`}>
              Anual <span className="text-[#008477] bg-[#008477]/10 px-2 py-0.5 rounded text-[11px] ml-1">-20% AHORRO</span>
            </span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`p-10 rounded-[32px] border transition-all text-left flex flex-col h-full ${plan.popular ? 'border-[#008477] bg-white shadow-xl shadow-[#008477]/5' : 'border-gray-100 bg-white'}`}>
                {plan.popular && (
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#008477] mb-4 bg-[#008477]/5 px-3 py-1 rounded w-fit">Recomendado</span>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black">{plan.getPrice(billingCycle)}€</span>
                  <span className="text-gray-400 font-bold">/mes</span>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-8 flex-1">{plan.description}</p>
                
                <div className="space-y-3 mb-10">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                      <Check className="w-3.5 h-3.5 text-[#008477]" /> {f}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className={`w-full py-4 rounded-xl text-sm font-bold transition-all active:scale-95 ${plan.popular ? 'bg-[#008477] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-100 inline-flex flex-col md:flex-row items-center gap-6">
            <div className="text-left">
              <h4 className="font-bold text-[#1a1f36]">Web Corporativa para tu Clínica</h4>
              <p className="text-sm text-gray-500">Diseño específico, SEO local y motor de reservas integrado.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">600€ <span className="text-xs font-bold text-gray-400">+ IVA</span></span>
              <button className="ml-4 px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">Saber más</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Simplified */}
      <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 text-center md:text-left">
            <div className="space-y-4 max-w-xs">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <NexoraLogo size={32} />
                <span className="font-bold text-xl text-[#1a1f36]">Nexora</span>
              </div>
              <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                El software de gestión que ahorra un 40% de tiempo a los profesionales de la salud.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm font-bold text-gray-500 tracking-tight">
              <a href="#" className="hover:text-[#008477] transition-colors">Servicios</a>
              <a href="#" className="hover:text-[#008477] transition-colors">Soluciones</a>
              <a href="#precios" className="hover:text-[#008477] transition-colors">Precios</a>
              <a href="#" className="hover:text-[#008477] transition-colors">Privacidad</a>
              <a href="#" className="hover:text-[#008477] transition-colors">Cookies</a>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[13px] font-bold text-gray-400 italic">by Antigravity Systems</div>
            <div className="text-[13px] font-bold text-gray-400">© 2026 Nexora. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>

      {/* Global CSS Styles */}
      <style>{`
        @theme {
          --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

    </div>
  );
}
