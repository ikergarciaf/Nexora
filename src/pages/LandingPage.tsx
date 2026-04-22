import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Brain, Calendar, CheckCircle2, Clock, MessageSquare, 
  Shield, Sparkles, Stethoscope, Zap, Layout, Database, Globe, 
  Check, Menu, X, ChevronRight, BarChart3, Users2, Star, ChevronDown, Monitor, Rocket, Info, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      icon: <Calendar className="w-5 h-5 text-[#008477]" />
    },
    {
      id: 'pacientes',
      title: "Historial Clínico Digital",
      description: "Fichas completas con LOPD, odontogramas y firma digital de documentos.",
      icon: <Users2 className="w-5 h-5 text-[#008477]" />
    },
    {
      id: 'facturacion',
      title: "Facturación y Cobros",
      description: "Emisión de facturas, presupuestos, cobros y liquidaciones a doctores en un clic.",
      icon: <BarChart3 className="w-5 h-5 text-[#008477]" />
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "49",
      description: "Pensado para profesionales autónomos.",
      features: [
        "Hasta 100 citas al mes",
        "Agenda Médica Inteligente",
        "Ficha paciente estándar",
        "Recordatorios básicos",
        "Soporte chat"
      ],
      cta: "Pruébalo gratis",
      popular: false
    },
    {
      name: "Pro",
      price: "89",
      description: "Para clínicas con equipo que buscan control total.",
      features: [
        "Citas ilimitadas",
        "Gestión de empleados",
        "Borradores IA WhatsApp",
        "Facturación avanzada",
        "Liquidaciones automáticas",
        "Soporte prioritario"
      ],
      cta: "Empezar prueba Pro",
      popular: true
    },
    {
      name: "Elite",
      price: "129",
      description: "Personalización total y Business Intelligence.",
      features: [
        "Todo lo de Pro",
        "Dashboard BI personalizado",
        "IA Generativa Full",
        "API para integraciones",
        "SLA garantizado",
        "Webinar trimestral"
      ],
      cta: "Solicitar Elite",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-[#1a1f36] font-sans selection:bg-[#008477]/10 selection:text-[#008477]">
      
      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="relative">
              <div className="w-10 h-10 bg-[#008477] rounded-[12px] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col -gap-1">
              <span className="font-bold text-2xl tracking-tighter text-[#008477]">Nexora</span>
              <span className="text-[10px] font-bold text-gray-400 -mt-1 uppercase tracking-widest pl-1">by Antigravity</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-1 text-[15px] font-bold text-[#4f566b] hover:text-[#008477] transition-colors cursor-pointer group">
              Soluciones <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <div className="flex items-center gap-1 text-[15px] font-bold text-[#4f566b] hover:text-[#008477] transition-colors cursor-pointer group">
              ¿A quién ayudamos? <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <a href="#precios" className="text-[15px] font-bold text-[#4f566b] hover:text-[#008477] transition-colors">Precios</a>
            <a href="#" className="text-[15px] font-bold text-[#4f566b] hover:text-[#008477] transition-colors">Biblioteca</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="hidden sm:block px-6 py-2.5 text-[15px] font-bold text-[#1a1f36] border border-gray-300 rounded-full hover:bg-gray-50 transition-all"
            >
              Iniciar Sesión
            </button>
            <button 
               onClick={() => navigate('/dashboard')}
              className="px-8 py-2.5 bg-[#008477] hover:bg-[#006b60] text-white text-[15px] font-bold rounded-full transition-all shadow-md active:scale-95"
            >
              Prueba gratis
            </button>
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-[#008477]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero: Replicated Layout */}
      <section className="relative px-6 pt-32 lg:pt-48 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <div className="inline-flex items-center px-4 py-1.5 bg-[#008477]/5 border border-[#008477]/10 text-[#008477] text-[12px] font-black uppercase tracking-[0.1em] rounded-md">
              SOFTWARE MÉDICO PARA CLÍNICAS
            </div>
            
            <h1 className="text-5xl lg:text-[76px] font-bold text-[#1a1f36] tracking-tight leading-[1.05] max-w-2xl">
              Todo lo que tu centro necesita, en un solo sistema
            </h1>
            
            <p className="text-xl text-[#4f566b] font-medium leading-[1.6] max-w-xl">
              Nexora utiliza IA para simplificar tu agenda, finanzas, historiales de pacientes y coordinación del personal, ayudándote a gestionar y hacer crecer tu clínica con total facilidad.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <input type="email" placeholder="Correo electrónico" className="flex-1 px-8 py-5 bg-white border-2 border-gray-100 rounded-full text-lg focus:outline-none focus:border-[#008477] transition-colors shadow-sm placeholder:text-gray-300 font-medium" />
              <input type="tel" placeholder="Teléfono" className="sm:w-48 px-8 py-5 bg-white border-2 border-gray-100 rounded-full text-lg focus:outline-none focus:border-[#008477] transition-colors shadow-sm placeholder:text-gray-300 font-medium" />
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-10 py-5 bg-[#008477] hover:bg-[#006b60] text-white text-lg font-bold rounded-full transition-all shadow-xl shadow-[#008477]/20 active:scale-95 whitespace-nowrap"
              >
                Solicita una demo
              </button>
            </div>
            <p className="text-[12px] text-[#8792a2] leading-relaxed max-w-lg font-medium">
              Al solicitar una demo, aceptas recibir comunicaciones sobre nuestros productos y servicios. Podrás darte de baja en cualquier momento. Consulta nuestra <span className="underline cursor-pointer hover:text-[#008477]">Política de Privacidad</span> y términos generales.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[60px] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] bg-slate-900 aspect-[4/3] flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=2000" 
                alt="Clinic management" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#008477]/20 to-transparent"></div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-24 h-24 bg-white/95 backdrop-blur text-[#008477] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
                  <Play className="w-10 h-10 fill-current ml-2" />
                </button>
              </div>

              {/* Data Widgets */}
              <div className="absolute top-12 left-10 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/50 w-56 animate-float-slow">
                <div className="text-[11px] font-black text-gray-400 mb-2 tracking-widest uppercase">Ingresos Mensuales</div>
                <div className="text-2xl font-bold flex items-center gap-2">26.086€ <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded">↑ 51%</span></div>
                <div className="mt-4 flex items-end gap-1.5 h-16">
                  {[40, 70, 45, 90, 60, 80, 55].map((h, i) => (
                    <div key={i} className={`flex-1 bg-[#008477] rounded-t-lg transition-all duration-500 delay-[${i*100}ms] origin-bottom scale-y-0 animate-[grow-up_0.8s_ease-out_forwards]`} style={{height: h + '%', animationDelay: `${i*100}ms`}}></div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-12 right-10 bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 w-72 animate-float-slow-delayed">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#008477] rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#1a1f36]">453</div>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Facturas enviadas</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1,2].map(i => (
                    <div key={i} className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                        <div className="space-y-1">
                          <div className="w-24 h-2.5 bg-slate-100 rounded"></div>
                          <div className="w-16 h-2 bg-slate-50 rounded"></div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-400">{i * 120}€</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Absolute Badges */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-[#2a43b1] text-white rounded-[24px] flex items-center justify-center shadow-2xl transform rotate-[-12deg] z-20 hover:rotate-0 transition-transform">
              <Shield className="w-10 h-10" />
            </div>
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#ffc107] text-white rounded-[32px] flex items-center justify-center shadow-2xl transform rotate-[15deg] z-20 hover:rotate-0 transition-transform">
              <Star className="w-12 h-12 fill-current" />
            </div>
          </motion.div>
        </div>
        
        {/* Animated Partners Feed */}
        <div className="max-w-7xl mx-auto px-6 mt-40">
          <p className="text-center text-[13px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">Empresas líderes que ya gestionan con Nexora</p>
          <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-12 grayscale opacity-30">
            {['ISEP', 'ANDA CONMIGO', 'MO DENT', 'FISIO ALCOBENDAS', 'CLINIEM'].map(p => (
              <span key={p} className="text-2xl font-black italic tracking-tighter hover:grayscale-0 hover:opacity-100 transition-all cursor-default">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs / Solutions Feature: Replica Clinic Cloud */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Potencia tu clínica por 10</h2>
            <p className="text-xl text-gray-500 font-medium">Cada funcionalidad ha sido diseñada de la mano con doctores y gerentes.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4 space-y-4">
              {features.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveTab(f.id)}
                  className={`w-full text-left p-8 rounded-3xl transition-all border-2 ${activeTab === f.id ? 'bg-[#008477]/5 border-[#008477] shadow-xl' : 'bg-white border-transparent hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-2 rounded-lg ${activeTab === f.id ? 'bg-[#008477] text-white' : 'bg-gray-100'}`}>
                      {f.icon}
                    </div>
                    <span className="font-bold text-xl">{f.title}</span>
                  </div>
                  <p className={`font-medium ${activeTab === f.id ? 'text-[#1a1f36]' : 'text-gray-400'}`}>{f.description}</p>
                </button>
              ))}
            </div>
            
            <div className="lg:col-span-8 bg-gray-50 rounded-[48px] p-12 lg:p-20 border border-gray-100 aspect-[16/10] relative overflow-hidden flex items-center justify-center group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="w-full h-full bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-8 pb-4 border-b">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-400"></div>
                       <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                       <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-10 w-1/3 bg-gray-100 rounded-lg"></div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-50 rounded-2xl" />)}
                    </div>
                    <div className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Web Banner */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#1a1f36] rounded-[60px] p-12 lg:p-24 text-white relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(26,31,54,0.3)]">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#008477]/20 to-transparent pointer-events-none"></div>
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-1.5 bg-[#008477] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-[#008477]/20">
                  DISEÑO Y LANZAMIENTO
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold leading-[1.1]">
                  Web Corporativa para tu Clínica
                </h2>
                <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl">
                  En Nexora no solo vendemos software. Construimos la presencia online de tu clínica: diseño personalizado, SEO local y motor de reservas integrado por solo <span className="text-white font-black">600€ + IVA</span>.
                </p>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => navigate('/dashboard')} className="px-10 py-5 bg-[#008477] hover:bg-[#006b60] text-white text-[17px] font-bold rounded-full transition-all shadow-xl shadow-[#008477]/30 active:scale-95 flex items-center gap-2">
                    Reservar ahora <ChevronRight className="w-5 h-5" />
                  </button>
                  <button className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white text-[17px] font-bold rounded-full transition-all border border-white/10">
                    Ver ejemplos
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 rotate-[-5deg] group-hover:rotate-0 transition-transform duration-700">
                 <div className="space-y-6 pt-12">
                   <div className="aspect-[3/4] bg-white text-[#1a1f36] p-8 rounded-[40px] shadow-2xl flex flex-col justify-between">
                     <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                     <div className="font-bold text-2xl">Móvil <br /> First</div>
                   </div>
                   <div className="aspect-square bg-[#008477] p-8 rounded-[40px] shadow-2xl flex flex-col justify-between">
                     <Globe className="w-10 h-10" />
                     <div className="font-bold text-xl">SEO Local</div>
                   </div>
                 </div>
                 <div className="space-y-6">
                    <div className="aspect-square bg-gray-800 p-8 rounded-[40px] shadow-2xl flex flex-col justify-between">
                      <Clock className="w-10 h-10 text-[#008477]" />
                      <div className="font-bold text-xl text-white">Listas hoy</div>
                    </div>
                    <div className="aspect-[3/4] bg-white text-[#1a1f36] p-8 rounded-[40px] shadow-2xl flex flex-col justify-between">
                      <Layout className="w-12 h-12 text-[#008477]" />
                      <div className="font-bold text-2xl">Reservas <br /> Web</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing: Clean & Sharp Replica */}
      <section id="precios" className="py-40 bg-[#fffcf8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-24 space-y-6">
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight">Planes de digitalización</h2>
            <p className="text-2xl text-gray-500 font-medium">14 días de prueba gratuita. Sin compromisos ni letra pequeña.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 items-end">
            {plans.map((plan, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className={`p-16 rounded-[60px] border-4 transition-all duration-300 relative bg-white ${plan.popular ? 'border-[#008477] shadow-[0_45px_100px_-20px_rgba(0,132,119,0.15)] z-10' : 'border-slate-100'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-10 -translate-y-1/2 bg-[#008477] text-white text-[12px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-xl shadow-xl">
                    Más popular
                  </div>
                )}
                
                <div className="mb-12">
                  <h3 className="text-3xl font-black text-[#1a1f36] mb-4">{plan.name}</h3>
                  <p className="text-[17px] font-semibold text-gray-400 leading-relaxed">{plan.description}</p>
                </div>
                
                <div className="mb-14 items-baseline flex gap-2">
                  <span className="text-7xl font-black text-[#1a1f36] tracking-tighter">{plan.price}€</span>
                  <span className="text-2xl font-bold text-gray-400">/mes</span>
                </div>

                <div className="space-y-6 mb-16">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-[#008477] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-lg font-bold text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>

                <button 
                   onClick={() => navigate('/dashboard')}
                  className={`w-full py-6 rounded-full text-xl font-black transition-all active:scale-95 shadow-2xl ${plan.popular ? 'bg-[#008477] hover:bg-[#006b60] text-white shadow-[#008477]/30' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial CTA Banner */}
      <section className="py-24 bg-[#008477]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20">
          <div className="text-white space-y-8">
            <h2 className="text-4xl lg:text-7xl font-bold leading-tight">Empieza a trabajar con Nexora hoy</h2>
            <p className="text-2xl text-white/80 font-medium">Miles de profesionales ya han dado el paso. ¿Y tú?</p>
            <div className="flex flex-wrap gap-12 pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7" />
                <span className="text-lg font-bold">14 días gratis</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7" />
                <span className="text-lg font-bold">Sin permanencia</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button 
               onClick={() => navigate('/dashboard')}
              className="px-16 py-8 bg-white text-[#008477] text-2xl font-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-4xl group"
            >
              Crear cuenta gratuita <ArrowRight className="inline-block ml-3 group-hover:translate-x-2 transition-all" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer: Replicated Full Style */}
      <footer className="bg-[#fcfaf6] border-t-2 border-gray-100 py-32">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16 mb-24">
             <div className="col-span-2 space-y-10">
                <div className="flex flex-col">
                  <span className="font-black text-4xl text-[#008477] tracking-tighter">Nexora</span>
                  <span className="font-bold text-[11px] text-gray-400 uppercase tracking-[0.3em] pl-1">by Antigravity</span>
                </div>
                <p className="text-xl text-[#4f566b] font-medium leading-relaxed max-w-sm">
                  La plataforma líder para centros que buscan excelencia en gestión médica, facturación e IA generativa.
                </p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-[#008477] text-[#008477]" />)}
                </div>
             </div>
             
             <div className="space-y-8">
               <h4 className="font-black text-[13px] uppercase tracking-widest text-slate-800">Solución</h4>
               <ul className="space-y-5 text-[17px] font-bold text-gray-400">
                 <li className="hover:text-[#008477] cursor-pointer">Agenda Médica</li>
                 <li className="hover:text-[#008477] cursor-pointer">Ficha Paciente</li>
                 <li className="hover:text-[#008477] cursor-pointer">Facturación</li>
                 <li className="hover:text-[#008477] cursor-pointer">IA Generativa</li>
               </ul>
             </div>

             <div className="space-y-8">
               <h4 className="font-black text-[13px] uppercase tracking-widest text-slate-800">Sectores</h4>
               <ul className="space-y-5 text-[17px] font-bold text-gray-400">
                 <li className="hover:text-[#008477] cursor-pointer">Odontología</li>
                 <li className="hover:text-[#008477] cursor-pointer">Fisioterapia</li>
                 <li className="hover:text-[#008477] cursor-pointer">Psicología</li>
                 <li className="hover:text-[#008477] cursor-pointer">Estética</li>
               </ul>
             </div>

             <div className="space-y-8">
               <h4 className="font-black text-[13px] uppercase tracking-widest text-slate-800">Precios</h4>
               <ul className="space-y-5 text-[17px] font-bold text-gray-400">
                 <li className="hover:text-[#008477] cursor-pointer">Plan Starter</li>
                 <li className="hover:text-[#008477] cursor-pointer">Plan Pro</li>
                 <li className="hover:text-[#008477] cursor-pointer">Plan Elite</li>
                 <li className="hover:text-[#008477] cursor-pointer">Web Corporativas</li>
               </ul>
             </div>

             <div className="space-y-8">
               <h4 className="font-black text-[13px] uppercase tracking-widest text-slate-800">Legal</h4>
               <ul className="space-y-5 text-[17px] font-bold text-gray-400">
                 <li className="hover:text-[#008477] cursor-pointer">Privacidad</li>
                 <li className="hover:text-[#008477] cursor-pointer">Cookies</li>
                 <li className="hover:text-[#008477] cursor-pointer">Aviso Legal</li>
                 <li className="hover:text-[#008477] cursor-pointer">RGPD</li>
               </ul>
             </div>
           </div>
           
           <div className="pt-20 border-t-2 border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-[15px] font-bold text-gray-400">© 2026 Nexora Systems SL. Todos los derechos reservados.</div>
             <div className="flex gap-10">
               <span className="text-[15px] font-black text-gray-400 hover:text-[#008477] cursor-pointer uppercase tracking-widest">LinkedIn</span>
               <span className="text-[15px] font-black text-gray-400 hover:text-[#008477] cursor-pointer uppercase tracking-widest">Instagram</span>
               <span className="text-[15px] font-black text-gray-400 hover:text-[#008477] cursor-pointer uppercase tracking-widest">X (Twitter)</span>
             </div>
           </div>
        </div>
      </footer>

      {/* Floating Action WhatsApp */}
      <div className="fixed bottom-10 right-10 z-[100]">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-20 h-20 bg-[#008477] text-white rounded-[24px] flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(0,132,119,0.5)] group"
        >
          <MessageSquare className="w-10 h-10 group-hover:rotate-12 transition-transform" />
        </motion.button>
      </div>

      {/* Global CSS Styles for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes grow-up {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        .animate-float-slow-delayed { animation: float 6s ease-in-out infinite; animation-delay: 1.5s; }
      `}</style>

    </div>
  );
}
