import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Brain, Calendar, CheckCircle2, Clock, Shield, Sparkles, 
  Stethoscope, Zap, Layout, Database, Globe, Check, Star, ChevronDown, 
  Monitor, Rocket, Info, Play, Users2, BarChart3, Apple, Activity, Heart, 
  Smile, Camera, FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { NexoraLogo } from '../components/NexoraLogo';

interface SpecialtyData {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  features: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  benefits: string[];
}

const specialties: Record<string, SpecialtyData> = {
  'dental': {
    title: "Software Gestión Clínica Dental",
    subtitle: "El odontograma digital que estabas esperando",
    description: "Digitaliza tu clínica dental con Nexora. Gestión de piezas dentales, presupuestos complejos y recordatorios de citas con IA.",
    heroImage: "https://images.unsplash.com/photo-1606811841660-1b5168c5c2b4?auto=format&fit=crop&q=80&w=1000",
    features: [
      { title: "Odontograma Digital", description: "Visualización interactiva FDI (11-48) para marcar caries, ausencias y tratamientos en segundos.", icon: <Smile className="w-6 h-6 text-[#008477]" /> },
      { title: "Presupuestos por Fases", description: "Agrupa tratamientos, aplica descuentos y envía el presupuesto al móvil del paciente para firma digital.", icon: <BarChart3 className="w-6 h-6 text-[#008477]" /> },
      { title: "IA de Relleno de Huecos", description: "Nuestra IA detecta cancelaciones y sugiere pacientes en lista de espera para cubrir el hueco automáticamente.", icon: <Brain className="w-6 h-6 text-[#008477]" /> }
    ],
    benefits: ["Sincronización con Rayos X", "Firma SEPA digital", "Gestión de laboratorios"]
  },
  'nutricion': {
    title: "Software para Nutricionistas",
    subtitle: "Planes de dieta y seguimiento antropométrico",
    description: "Tus pacientes alcanzarán sus objetivos más rápido con herramientas de seguimiento personalizadas y planes dinámicos.",
    heroImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000",
    features: [
      { title: "Diseñador de Dietas IA", description: "Genera propuestas de menús equilibrados basados en las preferencias y alergias del paciente.", icon: <Apple className="w-6 h-6 text-[#008477]" /> },
      { title: "Bioimpedancia Integrada", description: "Importa datos de básculas inteligentes y visualiza la evolución de masa muscular y grasa.", icon: <Activity className="w-6 h-6 text-[#008477]" /> },
      { title: "Portal de Recetas", description: "Acceso exclusivo para pacientes con biblioteca de recetas saludables y lista de la compra.", icon: <Monitor className="w-6 h-6 text-[#008477]" /> }
    ],
    benefits: ["Base de datos USDA/Atwater", "Exportación PDF premium", "Recordatorios de hidratación"]
  },
  'fisioterapia': {
    title: "Software Clínica Fisioterapia",
    subtitle: "Mapa de dolor y pautas de rehabilitación",
    description: "Identifica y trata lesiones de forma visual. El historial clínico que tus fisios realmente usarán.",
    heroImage: "https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=1000",
    features: [
      { title: "Mapa de Dolor Palpable", description: "Localiza el origen del dolor y registra la intensidad en cada sesión para ver la evolución real.", icon: <Heart className="w-6 h-6 text-[#008477]" /> },
      { title: "Prescripción de Ejercicio", description: "Envía rutinas de rehabilitación con videos en HD para que el paciente entrene correctamente en casa.", icon: <Play className="w-6 h-6 text-[#008477]" /> },
      { title: "Agenda de Bonos", description: "Gestión automática de sesiones restantes en bonos de tratamiento con avisos de agotamiento.", icon: <Database className="w-6 h-6 text-[#008477]" /> }
    ],
    benefits: ["Informes biomecánicos", "Recordatorios de ejercicios", "Facturación Fisiocare"]
  },
  'psicologos': {
    title: "Software para Psicólogos",
    subtitle: "Confidencialidad absoluta y notas dinámicas",
    description: "Céntrate en el proceso terapéutico mientras Nexora se encarga de la gestión y la facturación segura.",
    heroImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=1000",
    features: [
      { title: "Notas Terapéuticas Cifradas", description: "Separación clara entre notas clínicas y notas personales bajo doble factor de autenticación.", icon: <Shield className="w-6 h-6 text-[#008477]" /> },
      { title: "Teleconsulta HD", description: "Sala de video cifrada de extremo a extremo sin necesidad de instalar software adicional.", icon: <Monitor className="w-6 h-6 text-[#008477]" /> },
      { title: "Auto-registro del Paciente", description: "Escalas de ansiedad y estado de ánimo que el paciente completa entre sesiones.", icon: <Brain className="w-6 h-6 text-[#008477]" /> }
    ],
    benefits: ["Doble cifrado AES-256", "Gestión de grupos (taller)", "Plantillas DSM-V"]
  },
  'estetica': {
    title: "Software Clínica Estética",
    subtitle: "Control de tratamientos y galería de fotos",
    description: "Gestiona protocolos de belleza, control de stock y seguimiento fotográfico de tus tratamientos.",
    heroImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1000",
    features: [
      { title: "Tracking Fotográfico", description: "Comparativa 'Antes y Después' con herramientas de alineación para resultados profesionales.", icon: <Camera className="w-6 h-6 text-[#008477]" /> },
      { title: "Trazabilidad de Productos", description: "Control de lotes y caducidades de viales y productos estéticos de forma sencilla.", icon: <Database className="w-6 h-6 text-[#008477]" /> },
      { title: "CRM de Fidelización", description: "IA que sugiere campañas de retocada o nuevos tratamientos basados en el historial del cliente.", icon: <Sparkles className="w-6 h-6 text-[#008477]" /> }
    ],
    benefits: ["Firma consentimientos", "Venta online de productos", "Control de aparatología"]
  },
  'general': {
    title: "Gestión Médica General",
    subtitle: "Un sistema universal para cualquier especialidad",
    description: "La solución completa para policlínicas y médicos generales. Gestión integral, rápida y flexible.",
    heroImage: "https://images.unsplash.com/photo-1505751172107-1600868f05b0?auto=format&fit=crop&q=80&w=1000",
    features: [
      { title: "Historia Clínica Universal", description: "Estructura SOAP configurable y adaptable a pediatría, ginecología o medicina interna.", icon: <Stethoscope className="w-6 h-6 text-[#008477]" /> },
      { title: "Receta Electrónica", description: "Emisión de recetas privadas válidas en todas las farmacias del territorio nacional.", icon: <FileText className="w-6 h-6 text-[#008477]" /> },
      { title: "Interoperabilidad", description: "Sincroniza con principales aseguradoras y laboratorios para recepción de resultados.", icon: <Globe className="w-6 h-6 text-[#008477]" /> }
    ],
    benefits: ["Codificación CIE-10", "Gestión mutualidades", "Módulo de enfermería"]
  },
  'app-clientes': {
    title: "App para tus Clientes",
    subtitle: "Empodera a tus pacientes con tecnología",
    description: "Ofrece una experiencia premium. Tus pacientes podrán gestionar su salud desde la palma de su mano.",
    heroImage: "https://images.unsplash.com/photo-1512428559083-a400a40d4491?auto=format&fit=crop&q=80&w=1000",
    features: [
      { title: "Self-Checkin", description: "El paciente confirma su llegada a la clínica desde el móvil, reduciendo colas en recepción.", icon: <Clock className="w-6 h-6 text-[#008477]" /> },
      { title: "Carpeta de Salud", description: "Acceso a todos los informes, facturas y recetas sin necesidad de papel.", icon: <Database className="w-6 h-6 text-[#008477]" /> },
      { title: "Reserva de Citas IA", description: "Motor de búsqueda inteligente que recomienda el mejor horario según el tratamiento.", icon: <Calendar className="w-6 h-6 text-[#008477]" /> }
    ],
    benefits: ["Personalización de marca", "Pagos integrados", "Notificaciones push"]
  }
};

import { FrontendNavbar } from '../components/FrontendNavbar';

export default function SpecialtyLanding() {
  const { specialty } = useParams();
  const navigate = useNavigate();
  const data = specialties[specialty || 'general'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [specialty]);

  if (!data) return <div>Especialidad no encontrada</div>;

  return (
    <div className="min-h-screen bg-white text-[#1a1f36] font-sans">
      <FrontendNavbar />

      <section className="relative pt-32 lg:pt-48 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#008477]/10 text-[#008477] text-[12px] font-black uppercase tracking-wider rounded">
                Solución Especializada
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                {data.title}
              </h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed">
                {data.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => navigate(`/dashboard?specialty=${specialty}`)}
                  className="px-8 py-4 bg-[#008477] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
                >
                  Contratar Nexora {specialty?.charAt(0).toUpperCase()}{specialty?.slice(1)}
                </button>
                <button 
                   onClick={() => navigate(`/dashboard?specialty=${specialty}`)}
                   className="px-8 py-4 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  Ver demo interactiva <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px] font-bold text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {benefit}
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img src={data.heroImage} className="w-full h-full object-cover" alt={data.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-black mb-4">Potencia tu {specialty === 'app-clientes' ? 'negocio' : 'clínica'} con Nexora</h2>
            <p className="text-gray-500 font-medium italic">Funciones diseñadas exclusivamente para tu día a día.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {data.features.map((feature, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-black text-xl mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-semibold">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="flex justify-center mb-4">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />)}
            </div>
          </div>
          <h2 className="text-3xl font-black">Únete a más de 200 profesionales de {specialty} que ya confían en Nexora</h2>
          <p className="text-gray-500 font-medium">Empieza hoy tu prueba gratuita de 14 días. No requiere tarjeta de crédito.</p>
          <button 
             onClick={() => navigate(`/dashboard?specialty=${specialty}`)}
             className="px-10 py-5 bg-[#1a1f36] text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-xl"
          >
            Quiero mi prueba gratuita de 14 días
          </button>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 bg-[#fcfdff]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2" onClick={() => navigate('/')}>
            <NexoraLogo size={24} />
            <span className="font-bold text-lg text-[#1a1f36]">Nexora</span>
          </div>
          <div className="text-[13px] font-bold text-gray-400">© 2026 Nexora. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
