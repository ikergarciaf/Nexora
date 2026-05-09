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
  Quote,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { NexoraLogo } from '../components/NexoraLogo';
import { FrontendNavbar } from '../components/FrontendNavbar';

interface SpecialtyData {
  brandName?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  benefits: string[];
  testimonial?: { quote: string; name: string; role: string };
}

const specialties: Record<string, SpecialtyData> = {
  dental: {
    brandName: 'Nexora Dental',
    title: 'Software para clínicas dentales',
    subtitle: 'Odontograma digital y presupuestos por fases',
    description:
      'Plataforma diseñada para odontología, con herramientas específicas y datos aislados de otras especialidades.',
    image:
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1600',
    testimonial: {
      quote:
        'Pasamos de Excel a Nexora en una semana. Las cancelaciones se cubren solas y mi equipo recupera horas cada día.',
      name: 'Dra. Marta Rivas',
      role: 'Directora · Clínica Dental Rivas',
    },
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
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1600',
    testimonial: {
      quote:
        'El portal de recetas y la báscula sincronizada hacen que el paciente vea su evolución y se enganche al plan.',
      name: 'Sofía Martínez',
      role: 'Nutricionista clínica',
    },
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
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1600',
    testimonial: {
      quote:
        'El mapa de dolor es brutal. Los pacientes ven la evolución sesión a sesión y la adherencia sube muchísimo.',
      name: 'Iván López',
      role: 'Fisioterapeuta · Centro Movimiento',
    },
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
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1600',
    testimonial: {
      quote:
        'Las notas cifradas y el doble factor me dan tranquilidad absoluta con datos tan sensibles como los que manejo.',
      name: 'Carla Domínguez',
      role: 'Psicóloga clínica',
    },
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
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1600',
    testimonial: {
      quote:
        'El antes/después alineado y el control de viales son justo lo que pedíamos. Profesional y bonito.',
      name: 'Dra. Patricia Soler',
      role: 'Clínica Estética Soler',
    },
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
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600',
    testimonial: {
      quote:
        'Tenemos pediatría, ginecología y medicina interna en el mismo centro. Nexora se adapta a cada uno sin pelearse.',
      name: 'Dr. Andrés Quevedo',
      role: 'Director médico · Centro Vital',
    },
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
  'web-clinicas': {
    brandName: 'Nexora Web',
    title: 'Desarrollo Web Premium para Clínicas',
    subtitle: 'Sitio profesional + reserva online 24/7',
    description:
      'Creamos páginas web profesionales para clínicas y centros de salud. Diseño moderno, velocidad extrema y sincronización total con tu agenda Nexora para que conviertas más visitas en pacientes sin esfuerzo.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600',
    testimonial: {
      quote:
        'Desde que lanzamos la nueva web con reserva online integrada, las citas de nuevos pacientes han subido un 40% y recepción ha dejado de atender llamadas repetitivas. Se paga sola cada mes.',
      name: 'Dr. Julián Castro',
      role: 'Director · Centro Médico Avanzado',
    },
    features: [
      {
        title: 'Reserva online integrada',
        description: 'El paciente elige día y hora desde la web. La cita aparece al instante en tu agenda Nexora, sin intervención de recepción.',
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        title: 'SEO Médico Local',
        description: 'Posicionamos tu clínica en Google Maps y búsquedas locales para que te encuentren justo cuando te buscan en tu ciudad.',
        icon: <Globe className="w-5 h-5" />,
      },
      {
        title: 'Landing por servicio',
        description: 'Páginas individuales para cada tratamiento con formulario de contacto, galería y llamada a la acción directa.',
        icon: <FileText className="w-5 h-5" />,
      },
      {
        title: 'Diseño ultrarrápido',
        description: 'Carga en menos de 1 segundo. Mejora experiencia de usuario, reduce rebote y sube posiciones en Google.',
        icon: <Zap className="w-5 h-5" />,
      },
      {
        title: 'Blog de salud profesional',
        description: 'Artículos optimizados para atraer pacientes orgánicos y posicionarte como referente en tu especialidad.',
        icon: <Globe className="w-5 h-5" />,
      },
      {
        title: 'Panel de analítica',
        description: 'Métricas claras de visitas, procedencia, reservas y conversiones para saber qué funciona.',
        icon: <Monitor className="w-5 h-5" />,
      },
    ],
    benefits: ['Dominio .es/.com 1 año gratis', 'Hosting ultrarrápido incluido', 'Certificado SSL', 'Mantenimiento mensual', 'Formulario inteligente', 'Galería antes/después'],
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
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/')}
            className="text-[12.5px] text-slate-500 hover:text-slate-700 mb-6"
          >
            ← Volver a Nexora
          </motion.button>

          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
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
                className="text-[36px] sm:text-[44px] lg:text-[52px] leading-[1.05] font-semibold tracking-tight text-slate-900"
              >
                {data.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-lg text-slate-600 leading-relaxed"
              >
                {data.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                {specialty === 'web-clinicas' && (
                  <>
                    <button
                      onClick={() => navigate('/demo?type=quote')}
                      className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-slate-900 text-white text-[15px] font-medium hover:bg-[#008477] transition-colors"
                    >
                      Solicitar presupuesto sin compromiso
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 lg:py-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="p-8 lg:p-10 rounded-2xl bg-white ring-1 ring-slate-200/70">
              <Quote className="w-6 h-6 text-[#008477] mb-4" />
              <p className="text-[18px] lg:text-[20px] leading-relaxed text-slate-800 font-medium">
                “{data.testimonial.quote}”
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-[13px] font-semibold text-slate-600 flex items-center justify-center">
                  {data.testimonial.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">
                    {data.testimonial.name}
                  </div>
                  <div className="text-[13px] text-slate-500">{data.testimonial.role}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {specialty === 'web-clinicas' && (
        <>
          {/* Planes */}
          <section id="planes-web" className="py-20 lg:py-24 bg-slate-50/60 border-y border-slate-200/70">
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="max-w-2xl mb-12">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
                  Planes de desarrollo
                </p>
                <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
                  Elige el plan que mejor se adapte a tu clínica
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Básico',
                    desc: 'Perfecto para profesionales que empiezan o quieren una presencia digital profesional.',
                    features: [
                      'Landing page 1 sección',
                      'Diseño responsive',
                      'Reserva online integrada',
                      'Formulario de contacto',
                      'Certificado SSL',
                      'Hosting 6 meses',
                    ],
                  },
                  {
                    name: 'Profesional',
                    desc: 'Lo más elegido. Web completa con blog y SEO para atraer pacientes de forma orgánica.',
                    features: [
                      'Hasta 5 páginas',
                      'Blog de salud integrado',
                      'SEO On-page completo',
                      'Reserva online integrada',
                      'Galería de imágenes',
                      'Hosting 12 meses',
                      'Google My Business',
                      'Formulario inteligente',
                    ],
                    featured: true,
                  },
                  {
                    name: 'Premium',
                    desc: 'Solución integral con SEO continuo, mantenimiento y prioridad absoluta en soporte.',
                    features: [
                      'Web ilimitada en páginas',
                      'SEO Local + Maps',
                      'Blog + calendario editorial',
                      'Mantenimiento 12 meses',
                      'Hosting 12 meses',
                      'Dominio .es/.com 1 año',
                      'Analítica y reportes',
                      'Soporte prioritario 24/7',
                      'Copywriting profesional',
                    ],
                  },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative p-6 rounded-xl bg-white ring-1 transition-all hover:shadow-lg ${
                      (plan as any).featured ? 'ring-2 ring-[#008477] shadow-md scale-[1.02]' : 'ring-slate-200/70'
                    }`}
                  >
                    {(plan as any).featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#008477] text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
                        Más popular
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-slate-900 mt-1">{plan.name}</h3>
                    <p className="mt-3 text-[13px] text-slate-500 leading-relaxed">{plan.desc}</p>
                    <ul className="mt-5 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-slate-600">
                          <Check className="w-4 h-4 text-[#008477] shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate('/demo?type=quote')}
                      className={`mt-6 w-full h-11 rounded-lg text-[14px] font-medium transition-colors ${
                        (plan as any).featured
                          ? 'bg-[#008477] text-white hover:bg-[#006b61]'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      Solicitar presupuesto
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Proceso */}
          <section className="py-20 lg:py-24">
            <div className="max-w-4xl mx-auto px-6">
              <div className="max-w-2xl mb-14">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
                  Cómo trabajamos
                </p>
                <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
                  De la idea a tu web funcionando en 7 días
                </h2>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: '01', title: 'Análisis', desc: 'Estudiamos tu clínica, competencia y objetivos para definir la estrategia digital.' },
                  { step: '02', title: 'Diseño', desc: 'Creamos el mockup y lo revisamos contigo hasta que esté perfecto.' },
                  { step: '03', title: 'Desarrollo', desc: 'Maquetamos, integramos reserva online y optimizamos para velocidad y SEO.' },
                  { step: '04', title: 'Publicación', desc: 'Subimos la web, configuramos dominio y te formamos para gestionarla.' },
                ].map((p) => (
                  <div key={p.step} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#008477]/10 text-[#008477] text-lg font-bold flex items-center justify-center mx-auto mb-4">
                      {p.step}
                    </div>
                    <h3 className="font-semibold text-[15px] text-slate-900 mb-1.5">{p.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-2xl bg-slate-900 px-8 py-14 lg:px-14 lg:py-20 text-center">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
              {specialty === 'web-clinicas' ? '¿Listo para digitalizar tu clínica?' : `Empieza con ${data.brandName} hoy`}
            </h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto">
              {specialty === 'web-clinicas'
                ? 'Solicita una consultoría gratuita sin compromiso. Te explicamos cómo podemos ayudarte a atraer más pacientes.'
                : '14 días gratis, sin tarjeta. Si no encaja, te ayudamos a exportar tus datos.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              {specialty === 'web-clinicas' ? (
                <>
                    <button
                      onClick={() => navigate('/demo?type=quote')}
                      className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-medium hover:bg-slate-100 transition-colors"
                    >
                      Solicitar consultoría <ArrowRight className="w-4 h-4" />
                    </button>
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg ring-1 ring-white/20 text-white text-[15px] font-medium hover:bg-white/5 transition-colors"
                  >
                    Ver otros servicios
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/contratar/${specialty}`)}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-medium hover:bg-slate-100 transition-colors"
                  >
                    Ver planes y contratar <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg ring-1 ring-white/20 text-white text-[15px] font-medium hover:bg-white/5 transition-colors"
                  >
                    Ver todas las especialidades
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-slate-500">
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
