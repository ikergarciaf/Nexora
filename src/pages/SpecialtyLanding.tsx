import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  Calendar,
  Check,
  Database,
  Globe,
  Heart,
  Smile,
  Apple,
  Activity,
  Monitor,
  Sparkles,
  Stethoscope,
  Camera,
  Shield,
  Play,
  FileText,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { NexoraLogo } from '../components/NexoraLogo';
import { FrontendNavbar } from '../components/FrontendNavbar';

interface SpecialtyData {
  brandName?: string;
  title: string;
  subtitle: string;
  description: string;
  features: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  benefits: string[];
}

const specialties: Record<string, SpecialtyData> = {
  dental: {
    brandName: 'Nexora Dental',
    title: 'Software para clínicas dentales',
    subtitle: 'Odontograma digital y presupuestos por fases',
    description:
      'Plataforma diseñada para odontología, con herramientas específicas y datos aislados de otras especialidades.',
    features: [
      {
        title: 'Odontograma digital',
        description:
          'Notación FDI 11-48 para marcar caries, ausencias y tratamientos en segundos.',
        icon: <Smile className="w-5 h-5" />,
      },
      {
        title: 'Presupuestos por fases',
        description:
          'Agrupa tratamientos, aplica descuentos y envíalos al móvil del paciente para firma digital.',
        icon: <FileText className="w-5 h-5" />,
      },
      {
        title: 'IA de huecos en agenda',
        description:
          'Detecta cancelaciones y sugiere pacientes en lista de espera para cubrirlas.',
        icon: <Brain className="w-5 h-5" />,
      },
    ],
    benefits: ['Sincronización con rayos X', 'Firma SEPA digital', 'Gestión de laboratorios'],
  },
  nutricion: {
    brandName: 'Nexora Nutrición',
    title: 'Software para nutricionistas',
    subtitle: 'Planes de dieta y seguimiento antropométrico',
    description:
      'Un entorno enfocado en métricas corporales y planes nutricionales, sin funciones que no usarás.',
    features: [
      {
        title: 'Diseñador de dietas IA',
        description: 'Propuestas de menús equilibrados según preferencias y alergias del paciente.',
        icon: <Apple className="w-5 h-5" />,
      },
      {
        title: 'Bioimpedancia integrada',
        description: 'Importa datos de básculas inteligentes y visualiza la evolución corporal.',
        icon: <Activity className="w-5 h-5" />,
      },
      {
        title: 'Portal de recetas',
        description: 'Tus pacientes acceden a una biblioteca de recetas y lista de la compra.',
        icon: <Monitor className="w-5 h-5" />,
      },
    ],
    benefits: ['Base de datos USDA/Atwater', 'Exportación PDF premium', 'Recordatorios de hidratación'],
  },
  fisioterapia: {
    brandName: 'Nexora Fisioterapia',
    title: 'Software para fisioterapia',
    subtitle: 'Mapa de dolor y pautas de rehabilitación',
    description:
      'Plataforma dedicada a la rehabilitación: tu equipo trabaja sin distracciones de otras especialidades.',
    features: [
      {
        title: 'Mapa de dolor',
        description: 'Localiza el origen del dolor y registra la intensidad en cada sesión.',
        icon: <Heart className="w-5 h-5" />,
      },
      {
        title: 'Prescripción de ejercicio',
        description: 'Envía rutinas con vídeos en HD para que el paciente entrene en casa.',
        icon: <Play className="w-5 h-5" />,
      },
      {
        title: 'Bonos de sesiones',
        description: 'Gestión automática de sesiones restantes con avisos de agotamiento.',
        icon: <Database className="w-5 h-5" />,
      },
    ],
    benefits: ['Informes biomecánicos', 'Recordatorios automáticos', 'Facturación adaptada'],
  },
  psicologos: {
    brandName: 'Nexora Psicología',
    title: 'Software para psicólogos',
    subtitle: 'Confidencialidad absoluta y notas dinámicas',
    description:
      'Entorno blindado y aislado para que tus notas terapéuticas vivan en una instancia separada.',
    features: [
      {
        title: 'Notas cifradas',
        description: 'Separación clara entre notas clínicas y personales bajo doble factor.',
        icon: <Shield className="w-5 h-5" />,
      },
      {
        title: 'Teleconsulta HD',
        description: 'Sala de vídeo cifrada de extremo a extremo, sin instalar nada.',
        icon: <Monitor className="w-5 h-5" />,
      },
      {
        title: 'Auto-registro del paciente',
        description: 'Escalas de ansiedad y ánimo que el paciente completa entre sesiones.',
        icon: <Brain className="w-5 h-5" />,
      },
    ],
    benefits: ['Cifrado AES-256', 'Gestión de grupos y talleres', 'Plantillas DSM-V'],
  },
  estetica: {
    brandName: 'Nexora Estética',
    title: 'Software para medicina estética',
    subtitle: 'Control de tratamientos y galería fotográfica',
    description:
      'Plataforma para flujos de estética, con base de datos propia para fotos evolutivas e inventario.',
    features: [
      {
        title: 'Tracking fotográfico',
        description: 'Comparativa antes/después con herramientas de alineación profesionales.',
        icon: <Camera className="w-5 h-5" />,
      },
      {
        title: 'Trazabilidad de productos',
        description: 'Control de lotes y caducidades de viales y aparatología.',
        icon: <Database className="w-5 h-5" />,
      },
      {
        title: 'CRM de fidelización',
        description: 'Sugerencias automáticas de retoques y campañas según historial del cliente.',
        icon: <Sparkles className="w-5 h-5" />,
      },
    ],
    benefits: ['Firma de consentimientos', 'Venta online', 'Control de aparatología'],
  },
  general: {
    brandName: 'Nexora Clinical',
    title: 'Software para policlínicas',
    subtitle: 'Un sistema universal para múltiples especialidades',
    description:
      'Plataforma multi-especialidad modular para centros que combinan varias ramas clínicas.',
    features: [
      {
        title: 'Historia clínica universal',
        description: 'Estructura SOAP configurable para pediatría, ginecología o medicina interna.',
        icon: <Stethoscope className="w-5 h-5" />,
      },
      {
        title: 'Receta electrónica',
        description: 'Recetas privadas válidas en todas las farmacias del territorio nacional.',
        icon: <FileText className="w-5 h-5" />,
      },
      {
        title: 'Interoperabilidad',
        description: 'Sincroniza con aseguradoras y laboratorios para resultados.',
        icon: <Globe className="w-5 h-5" />,
      },
    ],
    benefits: ['Codificación CIE-10', 'Gestión mutualidades', 'Módulo de enfermería'],
  },
  'app-clientes': {
    brandName: 'Nexora Patient',
    title: 'App marca blanca para pacientes',
    subtitle: 'Tus pacientes gestionan su salud bajo tu marca',
    description:
      'Aplicación móvil independiente conectada al backend de tu clínica, personalizable con tu identidad.',
    features: [
      {
        title: 'Self check-in',
        description: 'El paciente confirma su llegada desde el móvil, reduciendo colas.',
        icon: <Clock className="w-5 h-5" />,
      },
      {
        title: 'Carpeta de salud',
        description: 'Acceso a informes, facturas y recetas sin papel.',
        icon: <Database className="w-5 h-5" />,
      },
      {
        title: 'Reservas con IA',
        description: 'Recomienda el mejor horario según el tipo de tratamiento.',
        icon: <Calendar className="w-5 h-5" />,
      },
    ],
    benefits: ['Personalización de marca', 'Pagos integrados', 'Notificaciones push'],
  },
};

export default function SpecialtyLanding() {
  const { specialty } = useParams();
  const navigate = useNavigate();
  const data = specialties[specialty || 'general'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [specialty]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Especialidad no encontrada
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#008477]/15 selection:text-[#008477]">
      <FrontendNavbar brandName={data.brandName} />

      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/')}
            className="text-[12.5px] text-slate-500 hover:text-slate-700 mb-6"
          >
            ← Volver a Nexora
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008477]/8 text-[#008477] text-[12px] font-medium mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#008477]" />
            {data.subtitle}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.05] font-semibold tracking-tight text-slate-900 max-w-3xl"
          >
            {data.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl"
          >
            {data.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => navigate(`/dashboard?specialty=${specialty}`)}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-slate-900 text-white text-[15px] font-medium hover:bg-[#008477] transition-colors"
            >
              Empezar gratis
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-700 text-[15px] font-medium ring-1 ring-slate-200 hover:ring-slate-300 transition-colors"
            >
              Ver precios
            </button>
          </motion.div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-slate-500">
            {data.benefits.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#008477]" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-24 bg-slate-50/60 border-y border-slate-200/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              Funciones específicas
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Hecho para tu día a día
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {data.features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl bg-white ring-1 ring-slate-200/70"
              >
                <div className="w-9 h-9 rounded-lg bg-[#008477]/10 text-[#008477] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[16px] text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-2xl bg-slate-900 px-8 py-14 lg:px-14 lg:py-20 text-center">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
              Empieza con {data.brandName} hoy
            </h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto">
              14 días gratis, sin tarjeta. Si no encaja, te ayudamos a exportar tus datos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/dashboard?specialty=${specialty}`)}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-medium hover:bg-slate-100 transition-colors"
              >
                Probar gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg ring-1 ring-white/20 text-white text-[15px] font-medium hover:bg-white/5 transition-colors"
              >
                Ver todas las especialidades
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-slate-500">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <NexoraLogo size={20} />
            <span className="font-medium text-slate-700">{data.brandName || 'Nexora'}</span>
          </button>
          <span>© {new Date().getFullYear()} Nexora · Datos en la UE · RGPD</span>
        </div>
      </footer>
    </div>
  );
}
