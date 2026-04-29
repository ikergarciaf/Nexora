import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Globe,
  ArrowRight,
  Check,
  Calendar,
  FileText,
  CreditCard,
  Sparkles,
  ChevronDown,
  Smile,
  Heart,
  Brain,
  Apple,
  Camera,
  Stethoscope,
  Smartphone,
  Quote,
  X,
  MessageCircle,
  Zap,
} from 'lucide-react';
import { FrontendNavbar } from '../components/FrontendNavbar';
import { NexoraLogo } from '../components/NexoraLogo';

type SpecialtyCard = {
  slug: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  image: string;
};

const SPECIALTIES: SpecialtyCard[] = [
  {
    slug: 'dental',
    name: 'Clínicas dentales',
    description: 'Odontograma digital, presupuestos por fases y firma online.',
    icon: <Smile className="w-5 h-5" />,
    image:
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200',
  },
  {
    slug: 'fisioterapia',
    name: 'Fisioterapia',
    description: 'Mapa de dolor, bonos de sesiones y planes de ejercicio.',
    icon: <Heart className="w-5 h-5" />,
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1200',
  },
  {
    slug: 'psicologos',
    name: 'Psicología',
    description: 'Notas cifradas, escalas DSM-V y teleconsulta segura.',
    icon: <Brain className="w-5 h-5" />,
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200',
  },
  {
    slug: 'nutricion',
    name: 'Nutrición',
    description: 'Diseñador de dietas IA, antropometría y portal de recetas.',
    icon: <Apple className="w-5 h-5" />,
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200',
  },
  {
    slug: 'estetica',
    name: 'Medicina estética',
    description: 'Antes y después fotográfico, lotes y CRM de fidelización.',
    icon: <Camera className="w-5 h-5" />,
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200',
  },
  {
    slug: 'general',
    name: 'Policlínica general',
    description: 'Historia clínica universal, receta electrónica y CIE-10.',
    icon: <Stethoscope className="w-5 h-5" />,
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Hemos pasado de Excel y agendas en papel a tener todo en Nexora. Las cancelaciones se cubren solas y mi equipo recupera 6 horas a la semana.',
    name: 'Dra. Marta Rivas',
    role: 'Directora · Clínica Dental Rivas',
    specialty: 'Dental',
  },
  {
    quote:
      'El mapa de dolor es brutal. Mis pacientes ven la evolución sesión a sesión y eso aumenta la adherencia al tratamiento muchísimo.',
    name: 'Iván López',
    role: 'Fisioterapeuta · Centro Movimiento',
    specialty: 'Fisioterapia',
  },
  {
    quote:
      'Las notas terapéuticas cifradas me dan tranquilidad. Y la teleconsulta no necesita instalar nada, mis pacientes mayores la usan sin problemas.',
    name: 'Carla Domínguez',
    role: 'Psicóloga clínica',
    specialty: 'Psicología',
  },
];

const INTEGRATIONS = [
  { name: 'Stripe', tag: 'Cobros y suscripciones' },
  { name: 'WhatsApp', tag: 'Recordatorios al paciente' },
  { name: 'Google Calendar', tag: 'Agenda sincronizada' },
  { name: 'Verifactu', tag: 'Facturación electrónica' },
  { name: 'Zoom', tag: 'Teleconsulta' },
  { name: 'Outlook', tag: 'Email del equipo' },
];

const COMPARISON = [
  { feature: 'Específico por especialidad', nexora: true, excel: false, generico: false },
  { feature: 'Recordatorios automáticos', nexora: true, excel: false, generico: true },
  { feature: 'Firma digital de consentimientos', nexora: true, excel: false, generico: false },
  { feature: 'IA clínica integrada', nexora: true, excel: false, generico: false },
  { feature: 'Datos cifrados en la UE', nexora: true, excel: false, generico: true },
  { feature: 'Sin permanencia', nexora: true, excel: true, generico: false },
  { feature: 'Migración asistida en 48h', nexora: true, excel: false, generico: false },
];

const CLIENT_LOGOS = [
  'Clínica Aurora',
  'Centro Médico Vital',
  'Dental Rivas',
  'Movimiento Fisio',
  'Nutri+',
  'Clínica Estética Soler',
];

const FEATURES = [
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Web Médica Personalizada',
    description:
      'Diseñamos y desarrollamos el sitio web oficial de tu clínica. Totalmente optimizado para buscadores (SEO) y conectado a tu agenda Nexora. Desde 399€ pago único.',
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: 'Secretaria IA en WhatsApp',
    description:
      'Tus pacientes agendan, cancelan o mueven citas por WhatsApp 24/7 sin que tú muevas un dedo. Nexora AI entiende el lenguaje natural.',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Historia clínica flexible',
    description:
      'Visión 360 del paciente con módulos específicos por especialidad. Firma digital de consentimientos integrada.',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Resúmenes Médicos IA',
    description:
      'Ahorra horas de documentación. Nuestra IA genera resúmenes clínicos precisos a partir de tus notas de sesión.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Elige tu especialidad',
    description:
      'Cada especialidad tiene su propio entorno con las herramientas que realmente necesitas.',
  },
  {
    number: '02',
    title: 'Prueba 14 días gratis',
    description:
      'Sin tarjeta de crédito. Tu equipo trabaja desde el primer día con datos reales.',
  },
  {
    number: '03',
    title: 'Contrata cuando lo veas',
    description:
      'Plan mensual o anual, sin permanencia. Cancela cuando quieras y conserva tus datos.',
  },
];

const FAQ = [
  {
    q: '¿Necesito instalar algo?',
    a: 'No. Nexora funciona en el navegador desde cualquier ordenador o tablet. Solo abre la web e inicia sesión.',
  },
  {
    q: '¿Mis datos están en Europa?',
    a: 'Sí. Servidores en la UE, copias de seguridad diarias, cifrado AES-256 y cumplimiento del RGPD.',
  },
  {
    q: '¿Hay permanencia?',
    a: 'No. Puedes cancelar cuando quieras. Si contratas el plan anual ahorras un 20%, pero nunca te obligamos a quedarte.',
  },
  {
    q: '¿Puedo migrar mis pacientes desde otro software?',
    a: 'Sí. Te ayudamos a importar tu base de pacientes y agenda en CSV durante el periodo de prueba.',
  },
  {
    q: '¿Cuánto tarda el equipo en aprender a usarlo?',
    a: 'La mayoría de clínicas trabaja con normalidad en 1 o 2 días. Tienes formación incluida y soporte humano.',
  },
];

const PLANS = [
  {
    name: 'Starter',
    description: 'Para profesionales independientes que empiezan.',
    monthly: 29,
    yearly: 24,
    features: [
      'Citas ilimitadas',
      'Agenda y ficha clínica básica',
      'Recordatorios por email',
      'Soporte estándar',
    ],
    cta: 'Empezar gratis',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Para clínicas en crecimiento con varios profesionales.',
    monthly: 59,
    yearly: 49,
    features: [
      'Todo lo de Starter',
      'Hasta 5 profesionales',
      'IA generativa incluida',
      'Presupuestos y facturación',
      'Soporte prioritario',
    ],
    cta: 'Probar 14 días',
    highlighted: true,
  },
  {
    name: 'Elite',
    description: 'Para cadenas y centros con varias sedes.',
    monthly: 99,
    yearly: 84,
    features: [
      'Profesionales ilimitados',
      'Múltiples sedes',
      'Cuadros de mando avanzados',
      'Integraciones API',
      'Account manager dedicado',
    ],
    cta: 'Hablar con ventas',
    highlighted: false,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#008477]/15 selection:text-[#008477]">
      <FrontendNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008477]/8 text-[#008477] text-[12px] font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#008477]" />
              Software clínico hecho por especialidad
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-[40px] sm:text-[52px] lg:text-[64px] leading-[1.05] font-semibold tracking-tight text-slate-900"
            >
              Gestiona tu clínica
              <br />
              <span className="text-[#008477]">sin papeleo.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl"
            >
              Agenda, historia clínica, facturación e IA en una sola plataforma. Elige tu
              especialidad y empieza a trabajar en minutos.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-slate-900 text-white text-[15px] font-medium hover:bg-[#008477] transition-colors"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('especialidades')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-700 text-[15px] font-medium ring-1 ring-slate-200 hover:ring-slate-300 transition-colors"
              >
                Ver especialidades
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-slate-500"
            >
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#008477]" /> 14 días gratis
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#008477]" /> Sin tarjeta
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#008477]" /> Sin permanencia
              </span>
            </motion.div>
          </div>

          {/* Hero mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 lg:mt-20"
          >
            <HeroMockup />
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-12 border-y border-slate-200/70 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-6">
            Construido junto a clínicas reales en España
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-4 gap-x-8 items-center">
            {CLIENT_LOGOS.map((name) => (
              <div
                key={name}
                className="text-center text-[13.5px] font-semibold tracking-tight text-slate-400/90 hover:text-slate-600 transition-colors"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="especialidades" className="py-20 lg:py-28 bg-slate-50/60 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              Elige tu especialidad
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Una versión de Nexora para cada clínica
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Cada especialidad tiene su propia base de datos y herramientas específicas. Sin
              menús innecesarios ni funciones que nunca usarás.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPECIALTIES.map((s) => (
              <button
                key={s.slug}
                onClick={() => navigate(`/soluciones/${s.slug}`)}
                className="group relative text-left rounded-xl bg-white ring-1 ring-slate-200/70 hover:ring-[#008477]/40 hover:shadow-sm transition-all overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur text-[#008477] flex items-center justify-center ring-1 ring-white">
                    {s.icon}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-1.5 gap-2">
                    <h3 className="font-semibold text-[16px] text-slate-900">{s.name}</h3>
                    <ArrowRight className="w-4 h-4 mt-1 text-slate-300 group-hover:text-[#008477] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-[13.5px] text-slate-500 leading-relaxed">{s.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              ¿Por qué Nexora?
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Específico para tu especialidad
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Una herramienta hecha para clínicas: con módulos pensados por especialidad, sin
              renunciar a la simpleza de un Excel ni a la potencia de un software médico.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200/70 bg-white">
            <table className="w-full text-left text-[14px] min-w-[640px]">
              <thead className="bg-slate-50/70 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="py-4 px-5 font-semibold">Característica</th>
                  <th className="py-4 px-5 font-semibold text-[#008477]">Nexora</th>
                  <th className="py-4 px-5 font-semibold">Excel / papel</th>
                  <th className="py-4 px-5 font-semibold">Software genérico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <td className="py-4 px-5 text-slate-700">{row.feature}</td>
                    <td className="py-4 px-5">{cell(row.nexora, true)}</td>
                    <td className="py-4 px-5">{cell(row.excel, false)}</td>
                    <td className="py-4 px-5">{cell(row.generico, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              Cómo funciona
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Tres pasos para empezar a trabajar
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <div className="text-[12px] font-mono text-[#008477] mb-4 tracking-widest">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-[14.5px] text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-slate-50/60 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              Todo en un sitio
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Las funciones que tu clínica usa cada día
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Sin saltar entre cuatro aplicaciones. Agenda, ficha clínica, facturación e IA
              integradas y conectadas entre sí.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl bg-white ring-1 ring-slate-200/70 hover:ring-slate-300 transition-colors"
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

      {/* Integrations */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              Conectado con tu stack
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Integraciones que ya usas
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Nexora habla con las herramientas con las que ya trabajas. Cobros, agenda,
              recordatorios y facturación electrónica sincronizados.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INTEGRATIONS.map((it) => (
              <div
                key={it.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-white ring-1 ring-slate-200/70 hover:ring-slate-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 ring-1 ring-slate-200/70 flex items-center justify-center text-[12px] font-semibold text-slate-700">
                  {it.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">{it.name}</div>
                  <div className="text-[12.5px] text-slate-500">{it.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              Precios
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Tarifas simples, sin sorpresas
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Sin permanencia, cancelas cuando quieras. Paga en euros con factura a tu nombre.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-10">
            <BillingToggle billing={billing} onChange={setBilling} />
            <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100 px-2 py-0.5 rounded">
              Ahorra 20% al año
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-7 rounded-2xl bg-white ring-1 transition-all flex flex-col ${
                  plan.highlighted
                    ? 'ring-slate-900 shadow-sm'
                    : 'ring-slate-200/70 hover:ring-slate-300'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-2.5 left-7 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 text-white">
                    Recomendado
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-[13.5px] text-slate-500 leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-slate-900">
                    {billing === 'monthly' ? plan.monthly : plan.yearly}€
                  </span>
                  <span className="text-[13px] text-slate-500">/mes</span>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`mt-6 h-11 rounded-lg text-[14px] font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-slate-900 text-white hover:bg-[#008477]'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </button>
                <ul className="mt-7 space-y-3 border-t border-slate-100 pt-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-slate-700">
                      <Check className="w-4 h-4 mt-0.5 text-[#008477] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-slate-50/60 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              Lo que dicen las clínicas
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Profesionales que ya trabajan con Nexora
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-xl bg-white ring-1 ring-slate-200/70 flex flex-col"
              >
                <Quote className="w-5 h-5 text-[#008477] mb-4" />
                <p className="text-[14.5px] text-slate-700 leading-relaxed flex-1">
                  “{t.quote}”
                </p>
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-[12px] font-semibold text-slate-600 flex items-center justify-center">
                    {t.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold text-slate-900">{t.name}</div>
                    <div className="text-[12.5px] text-slate-500">{t.role}</div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#008477] bg-[#008477]/8 px-2 py-0.5 rounded">
                    {t.specialty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#008477] mb-3">
              Preguntas frecuentes
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="divide-y divide-slate-200/80 border-y border-slate-200/80">
            {FAQ.map((item, i) => {
              const open = openFaq === i;
              return (
                <button
                  key={item.q}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full text-left py-5 flex items-start gap-4"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-[15.5px]">{item.q}</div>
                    {open && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-[14px] text-slate-600 leading-relaxed"
                      >
                        {item.a}
                      </motion.p>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 mt-1 text-slate-400 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo banner */}
      <section className="py-20 lg:py-24 bg-slate-50/60 border-y border-slate-200/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
            <div className="w-12 h-12 rounded-xl bg-[#008477]/10 text-[#008477] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl lg:text-2xl font-semibold tracking-tight text-slate-900">
                ¿Prefieres que te lo enseñemos?
              </h3>
              <p className="mt-2 text-[14.5px] text-slate-600 leading-relaxed">
                Reserva una demo personalizada de 20 minutos. Te mostramos Nexora con un caso de
                tu especialidad y te ayudamos a migrar tus datos en 48h.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0">
              <button
                onClick={(e) => {
                  const subject = encodeURIComponent('Demo personalizada Nexora');
                  window.location.href = `mailto:hola@nexora.co?subject=${subject}`;
                }}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-slate-900 text-white text-[14px] font-medium hover:bg-[#008477] transition-colors"
              >
                Reservar demo <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://wa.me/34000000000?text=Hola%2C%20quiero%20m%C3%A1s%20info%20de%20Nexora"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-white text-slate-700 text-[14px] font-medium ring-1 ring-slate-200 hover:ring-slate-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl bg-slate-900 px-8 py-14 lg:px-14 lg:py-20 text-center">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
              Empieza hoy. Sin tarjeta.
            </h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto">
              Crea tu cuenta y prueba Nexora 14 días gratis. Si no encaja, te ayudamos a exportar
              tus datos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-medium hover:bg-slate-100 transition-colors"
              >
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white/0 ring-1 ring-white/20 text-white text-[15px] font-medium hover:bg-white/5 transition-colors"
              >
                Ver precios
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <NexoraLogo size={24} />
                <span className="font-semibold text-[16px] tracking-tight text-slate-900">
                  Nexora
                </span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Software clínico para profesionales de la salud. Hecho en Europa.
              </p>
            </div>
            <FooterColumn
              title="Especialidades"
              items={SPECIALTIES.slice(0, 6).map((s) => ({
                label: s.name,
                onClick: () => navigate(`/soluciones/${s.slug}`),
              }))}
            />
            <FooterColumn
              title="Producto"
              items={[
                {
                  label: 'Precios',
                  onClick: () =>
                    document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' }),
                },
                {
                  label: 'Preguntas frecuentes',
                  onClick: () =>
                    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }),
                },
                { label: 'Iniciar sesión', onClick: () => navigate('/dashboard') },
                { label: 'Empezar gratis', onClick: () => navigate('/dashboard') },
              ]}
            />
            <FooterColumn
              title="Legal"
              items={[
                { label: 'Política de privacidad', onClick: () => null },
                { label: 'Términos y condiciones', onClick: () => null },
                { label: 'Política de cookies', onClick: () => null },
                { label: 'Contacto', onClick: () => null },
              ]}
            />
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-slate-400">
            <span>© {new Date().getFullYear()} Nexora. Todos los derechos reservados.</span>
            <span>Datos alojados en la UE · RGPD</span>
          </div>
        </div>
      </footer>

      <FloatingContact />
    </div>
  );
}

function cell(value: boolean, highlight: boolean) {
  if (value) {
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
          highlight ? 'bg-[#008477]/10 text-[#008477]' : 'bg-emerald-50 text-emerald-600'
        }`}
      >
        <Check className="w-3.5 h-3.5" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
      <X className="w-3.5 h-3.5" />
    </span>
  );
}

function FloatingContact() {
  const [open, setOpen] = useState(false);
  
  const handleEmailClick = (e: React.MouseEvent, type: string) => {
    // Standard mailto handling, ensuring it doesn't get blocked
    const subject = type === 'demo' ? 'Demo personalizada Nexora' : 'Consulta Nexora';
    window.location.href = `mailto:hola@nexora.co?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mb-3 w-72 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/80 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-slate-900">¿Hablamos?</div>
              <div className="text-[12px] text-slate-500">Respondemos en minutos</div>
            </div>
          </div>
          <div className="space-y-2">
            <a
              href="https://wa.me/34000000000?text=Hola%2C%20quiero%20m%C3%A1s%20info%20de%20Nexora"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
            >
              <span className="text-[13.5px] font-medium text-slate-800">WhatsApp</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
            <button
              onClick={(e) => handleEmailClick(e, 'consulta')}
              className="w-full flex items-center justify-between gap-3 p-2.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 transition-colors text-left"
            >
              <span className="text-[13.5px] font-medium text-slate-800">Email</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={(e) => handleEmailClick(e, 'demo')}
              className="w-full flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900 text-white hover:bg-[#008477] transition-colors text-left"
            >
              <span className="text-[13.5px] font-medium">Reservar demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar contacto' : 'Abrir contacto'}
        className="w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors flex items-center justify-center"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; onClick: () => void | null }[];
}) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-900 mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.label}>
            <button
              onClick={it.onClick}
              className="text-[13.5px] text-slate-500 hover:text-slate-900 transition-colors text-left"
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BillingToggle({
  billing,
  onChange,
}: {
  billing: 'monthly' | 'yearly';
  onChange: (b: 'monthly' | 'yearly') => void;
}) {
  return (
    <div className="inline-flex p-1 rounded-lg bg-slate-100 ring-1 ring-slate-200/80">
      {(['monthly', 'yearly'] as const).map((b) => (
        <button
          key={b}
          onClick={() => onChange(b)}
          className={`h-8 px-4 rounded-md text-[13px] font-medium transition-colors ${
            billing === b ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {b === 'monthly' ? 'Mensual' : 'Anual'}
        </button>
      ))}
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-6 -inset-y-6 lg:-inset-x-10 lg:-inset-y-10 -z-10 rounded-[32px] bg-gradient-to-b from-[#008477]/8 to-transparent blur-2xl" />
      <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)] overflow-hidden">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 h-9 bg-slate-50 border-b border-slate-200/70">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="mx-auto h-5 px-3 flex items-center text-[11px] text-slate-500 bg-white rounded ring-1 ring-slate-200/80">
            app.nexora.co
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <div className="hidden lg:flex flex-col gap-1 p-4 border-r border-slate-200/70 bg-slate-50/40 text-[13px]">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-3">
              <NexoraLogo size={20} />
              <span className="font-semibold text-slate-900">Nexora</span>
            </div>
            {['Inicio', 'Agenda', 'Pacientes', 'Facturación', 'Informes'].map((it, i) => (
              <div
                key={it}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-md ${
                  i === 1 ? 'bg-[#008477]/10 text-[#008477] font-medium' : 'text-slate-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {it}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                  Hoy
                </div>
                <div className="text-base font-semibold text-slate-900">Agenda · martes 12</div>
              </div>
              <button className="h-8 px-3 rounded-md bg-slate-900 text-white text-[12px] font-medium">
                + Nueva cita
              </button>
            </div>

            <div className="grid gap-2">
              {[
                { time: '09:00', name: 'Lucía Martín', tag: 'Revisión', color: 'bg-emerald-100 text-emerald-700' },
                { time: '10:30', name: 'Carlos Pérez', tag: 'Limpieza', color: 'bg-sky-100 text-sky-700' },
                { time: '12:00', name: 'Ana García', tag: 'Primera visita', color: 'bg-amber-100 text-amber-700' },
                { time: '16:30', name: 'Iván Ruiz', tag: 'Endodoncia', color: 'bg-rose-100 text-rose-700' },
              ].map((row) => (
                <div
                  key={row.time}
                  className="flex items-center gap-4 p-3 rounded-lg ring-1 ring-slate-200/70 bg-white"
                >
                  <div className="text-[12px] font-mono text-slate-500 w-12">{row.time}</div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 flex items-center justify-center">
                    {row.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div className="flex-1 text-[13.5px] text-slate-800">{row.name}</div>
                  <span className={`text-[11px] px-2 py-0.5 rounded ${row.color}`}>{row.tag}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: 'Citas hoy', value: '12' },
                { label: 'Ocupación', value: '86%' },
                { label: 'Pendiente cobro', value: '€340' },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="p-3 rounded-lg bg-slate-50 ring-1 ring-slate-200/70"
                >
                  <div className="text-[11px] text-slate-500">{kpi.label}</div>
                  <div className="text-base font-semibold text-slate-900">{kpi.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
