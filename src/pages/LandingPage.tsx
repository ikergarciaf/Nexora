import React, { useState, useEffect } from 'react';
import { 
  Check, Star, ChevronRight, Play, Server, Shield, 
  ArrowRight, Users2, Calendar, BarChart3, Brain, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { NexoraLogo } from '../components/NexoraLogo';
import { FrontendNavbar } from '../components/FrontendNavbar';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFeatureTab, setActiveFeatureTab] = useState('agenda');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const stats = [
    { value: "+500", label: "Clínicas Activas" },
    { value: "4.9/5", label: "Satisfacción Clínicas" },
    { value: "-40%", label: "Tiempo Administrativo" },
    { value: "24/7", label: "Soporte Técnico" }
  ];

  const showcaseFeatures = [
    {
      id: 'agenda',
      title: "Agenda Inteligente",
      description: "Visualiza la disponibilidad de todo tu equipo al instante. Optimiza huecos, envía recordatorios automáticos por WhatsApp y reduce inasistencias en un 30%.",
      image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=1200",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'pacientes',
      title: "Historial Clínico",
      description: "Una visión 360 grados de cada paciente. Odontogramas, evolución de peso, mapas de dolor, consentimientos firmados digitalmente y adjuntos médicos.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200",
      icon: <Users2 className="w-5 h-5" />
    },
    {
      id: 'facturacion',
      title: "Facturación y Cobros",
      description: "Crea presupuestos en segundos. Factura con un clic, lleva el control de cajas diario y analiza la rentabilidad de cada tratamiento.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'ia',
      title: "Inteligencia Artificial",
      description: "Genera resúmenes automáticos tras cada visita. Obtén sugerencias de diagnósticos basadas en los síntomas introducidos en historias clínicas.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
      icon: <Brain className="w-5 h-5" />
    }
  ];

  const activeShowcase = showcaseFeatures.find(f => f.id === activeFeatureTab);

  const plans = [
    {
      name: "Starter",
      getPrice: (cycle: string) => cycle === 'monthly' ? "29" : "24",
      description: "Para profesionales independientes.",
      features: [
        "Citas ILIMITADAS",
        "Agenda Médica",
        "Ficha paciente básica",
        "Recordatorios Email",
        "Soporte Estándar"
      ],
      cta: "Empezar prueba gratis",
      popular: false
    },
    {
      name: "Pro",
      getPrice: (cycle: string) => cycle === 'monthly' ? "59" : "49",
      description: "El más popular para clínicas en crecimiento.",
      features: [
        "Todo lo del Starter",
        "Hasta 5 Profesionales",
        "IA Generativa Incluida",
        "Facturación y Presupuestos",
        "Soporte Prioritario"
      ],
      cta: "Prueba 14 días",
      popular: true
    },
    {
      name: "Elite",
      getPrice: (cycle: string) => cycle === 'monthly' ? "99" : "84",
      description: "Cadenas y centros avanzados.",
      features: [
        "Profesionales ILIMITADOS",
        "Múltiples Sedes",
        "Cuadros de Mando BI",
        "Integraciones API",
        "Account Manager"
      ],
      cta: "Hablar con ventas",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1f36] font-sans selection:bg-[#008477]/10 selection:text-[#008477]">
      <FrontendNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#008477]/[0.02] -z-10" />
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-[#008477]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-[#008477]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex flex-wrap justify-center lg:justify-start items-center gap-2 px-4 py-2 bg-[#008477]/5 border border-[#008477]/10 rounded-full text-[#008477] text-[13px] font-bold shadow-sm"
            >
              <NexoraLogo size={16} /> 
              <span>Votado #1 Software Clínico 2026</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900"
            >
              Todo tu centro médico,<br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008477] to-[#059669]">
                en un único lugar
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Desde la reserva online hasta la facturación. Nexora automatiza el papeleo para que puedas enfocarte en la salud de tus pacientes.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-4"
            >
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 bg-[#008477] hover:bg-[#007065] text-white text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-[#008477]/30 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-slate-700 text-base font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 text-[#008477]" />
                Ver demo
              </button>
            </motion.div>
            <div className="flex flex-row justify-center lg:justify-start items-center gap-3 pt-4 opacity-70">
                <Check className="w-4 h-4 text-[#008477]"/> <span className="text-[13px] font-bold">Sin descargas</span>
                <Check className="w-4 h-4 text-[#008477] ml-2"/> <span className="text-[13px] font-bold">Sin tarjeta </span>
                <Check className="w-4 h-4 text-[#008477] ml-2"/> <span className="text-[13px] font-bold">Soporte gratis</span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative lg:h-[600px] hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#008477]/20 to-transparent rounded-[40px] transform rotate-3" />
            <img 
              src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1600" 
              alt="Nexora Dashboard" 
              className="relative z-10 w-full h-full object-cover rounded-[32px] shadow-2xl border flex border-white/50"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#008477]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20">
            {stats.map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[12px] font-bold text-emerald-100 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Features Section with Tabs */}
      <section id="demo" className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">La solución completa para tu clínica</h2>
            <p className="text-lg text-gray-500 font-medium">Olvídate de utilizar 4 aplicaciones diferentes. Con Nexora tienes la gestión, comunicación y control en una sola ventana.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Tabs Sidebar */}
            <div className="lg:w-1/3 flex flex-row lg:flex-col gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-none">
              {showcaseFeatures.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveFeatureTab(item.id)}
                  className={`flex-none lg:w-full flex items-start gap-4 p-5 rounded-2xl text-left transition-all border ${activeFeatureTab === item.id ? 'bg-white border-[#008477] shadow-xl shadow-[#008477]/5 scale-100' : 'bg-transparent border-transparent hover:bg-gray-100/50 grayscale opacity-80'}`}
                >
                  <div className={`p-3 rounded-xl flex items-center justify-center transition-colors ${activeFeatureTab === item.id ? 'bg-[#008477] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {item.icon}
                  </div>
                  <div className="hidden lg:block">
                    <h3 className={`font-bold text-lg mb-1 transition-colors ${activeFeatureTab === item.id ? 'text-[#008477]' : 'text-slate-700'}`}>{item.title}</h3>
                    <p className={`text-[13px] leading-relaxed transition-opacity ${activeFeatureTab === item.id ? 'text-gray-600' : 'text-gray-400 line-clamp-2'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Showcase Image Area */}
            <div className="lg:w-2/3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeatureTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-2 rounded-3xl border border-gray-100 shadow-2xl overflow-hidden group"
                >
                  {/* Fake Browser Top Bar */}
                  <div className="bg-gray-50 flex items-center px-4 py-3 rounded-tl-2xl rounded-tr-2xl border-b border-gray-100 gap-2">
                     <div className="flex gap-1.5">
                       <div className="w-3 h-3 rounded-full bg-red-400"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                       <div className="w-3 h-3 rounded-full bg-green-400"></div>
                     </div>
                     <div className="flex-1 text-center">
                        <div className="w-64 mx-auto bg-white border border-gray-200 rounded-md py-1 px-3 text-[10px] text-gray-400 flex items-center justify-center gap-2">
                          <Shield className="w-3 h-3" /> app.nexora.co
                        </div>
                     </div>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-bl-2xl rounded-br-2xl bg-gray-100">
                    <img 
                      src={activeShowcase?.image} 
                      alt={activeShowcase?.title}
                      className="w-full h-full object-cover object-left-top transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay info box on mobile */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6 lg:hidden">
                       <h3 className="text-white font-bold text-xl mb-2">{activeShowcase?.title}</h3>
                       <p className="text-gray-200 text-sm leading-relaxed">{activeShowcase?.description}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Tech Specs */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-slate-900 rounded-[32px] p-10 md:p-16 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#008477]/30 to-purple-600/30 blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl text-left">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Seguridad LOPD de grado bancario</h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Tus datos y los de tus pacientes están seguros. Cumplimos estrictamente la RGPD europea con servidores alojados en UE. Copias de seguridad diarias, encriptación AES-256 e historial de accesos.
                </p>
                <div className="grid grid-cols-2 gap-6">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Server className="w-5 h-5 text-emerald-400" /></div>
                     <span className="text-sm font-bold text-white">Servidores AWS (EU)</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Shield className="w-5 h-5 text-emerald-400" /></div>
                     <span className="text-sm font-bold text-white">Certificado ISO 27001</span>
                   </div>
                </div>
              </div>

              <div className="relative z-10 shrink-0">
                <div className="w-48 h-48 rounded-full border-[8px] border-white/10 flex items-center justify-center relative">
                   <Shield className="w-20 h-20 text-emerald-400" />
                   <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-20" />
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Detailed Pricing */}
      <section id="precios" className="pt-16 pb-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-4xl font-black tracking-tight">Elige el plan ideal</h2>
            <p className="text-lg text-gray-500 font-medium">Total transparencia, puedes cancelar cuando quieras. Paga en euros, sin sorpresas ni comisiones ocultas.</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-[#1a1f36]' : 'text-gray-400'}`}>Mensual</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
              className="w-16 h-8 bg-gray-200 rounded-full p-1 relative flex items-center cursor-pointer shadow-inner"
            >
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                className="w-6 h-6 bg-[#008477] rounded-full shadow-md"
              />
            </button>
            <span className={`text-sm font-bold transition-colors ${billingCycle === 'annually' ? 'text-[#1a1f36]' : 'text-gray-400'}`}>
              Anual <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px] ml-1 uppercase tracking-widest">-20% OUT</span>
            </span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div key={i} className={`p-10 rounded-3xl border transition-all text-left flex flex-col h-full bg-white relative ${plan.popular ? 'border-[#008477] shadow-xl ring-2 ring-[#008477]/20 scale-105 z-10' : 'border-gray-200 hover:border-[#008477]/50'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#008477] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-md">
                     Más Elegido
                  </div>
                )}
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 font-medium mb-6 h-10">{plan.description}</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">{plan.getPrice(billingCycle)}€</span>
                  <span className="text-gray-400 font-bold">/mes</span>
                </div>
                
                <div className="space-y-4 mb-10 border-t border-gray-100 pt-8 flex-1">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center mt-0.5">
                         <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-[14px] font-bold text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className={`w-full py-4 rounded-xl text-[15px] font-black transition-all active:scale-95 flex justify-center items-center gap-2 ${plan.popular ? 'bg-[#008477] hover:bg-[#007065] text-white shadow-lg shadow-[#008477]/20' : 'bg-gray-100 text-slate-800 hover:bg-gray-200'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-col items-center">
            <h4 className="text-xl font-bold mb-4">¿Tienes una gran red de clínicas?</h4>
            <button className="px-8 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-[#008477] hover:text-[#008477] transition-all">
               <Phone className="w-5 h-5" /> Contacta con Ventas
            </button>
          </div>
        </div>
      </section>

      {/* Footer Complete */}
      <footer className="bg-slate-900 border-t border-gray-800 pt-24 pb-12 text-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <NexoraLogo size={32} />
                <span className="font-black text-2xl text-white">Nexora</span>
              </div>
              <p className="text-[13px] text-gray-400 font-medium leading-relaxed mb-6">
                Software clínico integral. Revolucionando el sector de la salud con Inteligencia Artificial.
              </p>
            </div>
            
            <div>
               <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[12px]">Soluciones</h4>
               <ul className="space-y-4 text-[14px] font-medium text-gray-400">
                 <li><button onClick={() => navigate('/soluciones/dental')} className="hover:text-emerald-400 transition-colors">Clínicas Dentales</button></li>
                 <li><button onClick={() => navigate('/soluciones/fisioterapia')} className="hover:text-emerald-400 transition-colors">Centros de Fisioterapia</button></li>
                 <li><button onClick={() => navigate('/soluciones/psicologos')} className="hover:text-emerald-400 transition-colors">Gabinetes de Psicología</button></li>
                 <li><button onClick={() => navigate('/soluciones/nutricion')} className="hover:text-emerald-400 transition-colors">Nutrición y Dietética</button></li>
                 <li><button onClick={() => navigate('/soluciones/estetica')} className="hover:text-emerald-400 transition-colors">Medicina Estética</button></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[12px]">Producto</h4>
               <ul className="space-y-4 text-[14px] font-medium text-gray-400">
                 <li><button onClick={() => document.getElementById('demo')?.scrollIntoView()} className="hover:text-emerald-400 transition-colors">Funcionalidades</button></li>
                 <li><button onClick={() => document.getElementById('precios')?.scrollIntoView()} className="hover:text-emerald-400 transition-colors">Tarifas</button></li>
                 <li><button onClick={() => navigate('/dashboard')} className="hover:text-emerald-400 transition-colors">App Pacientes</button></li>
                 <li><button onClick={() => navigate('/dashboard')} className="hover:text-emerald-400 transition-colors">Cita Online Pública</button></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[12px]">Legal e Info</h4>
               <ul className="space-y-4 text-[14px] font-medium text-gray-400">
                 <li><a href="#" className="hover:text-emerald-400 transition-colors">Contacto</a></li>
                 <li><a href="#" className="hover:text-emerald-400 transition-colors">Política de Privacidad</a></li>
                 <li><a href="#" className="hover:text-emerald-400 transition-colors">Términos y Condiciones</a></li>
                 <li><a href="#" className="hover:text-emerald-400 transition-colors">Política de Cookies</a></li>
               </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[13px] font-bold text-gray-500">© 2026 Nexora. Todos los derechos reservados. Desarrollado con dedicación para médicos.</div>
            <div className="text-[13px] font-bold text-gray-500 flex items-center gap-2">
               by <span className="text-white hover:text-[#008477]">Antigravity Systems</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

