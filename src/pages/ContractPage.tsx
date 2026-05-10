import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, ArrowRight, Shield, Clock, Users, CreditCard } from 'lucide-react';
import { NexoraLogo } from '../components/NexoraLogo';
import { FrontendNavbar } from '../components/FrontendNavbar';

const SAAS_DATA: Record<string, { name: string; subtitle: string; desc: string; color: string; plans: { name: string; price: string; desc: string; features: string[]; popular?: boolean }[] }> = {
  dental: {
    name: 'Nexora Dental', subtitle: 'Odontograma digital y presupuestos por fases', desc: 'Gestiona tu clínica dental con herramientas específicas: odontograma digital, presupuestos por fases y firma online.',
    color: '#008477',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para profesionales independientes', features: ['Hasta 50 pacientes', 'Agenda básica', 'Odontograma digital', 'Recordatorios automáticos', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para clínicas en crecimiento', features: ['Pacientes ilimitados', 'Agenda inteligente', 'Presupuestos por fases', 'Firma digital', 'IA de huecos', '5 profesionales', 'Soporte prioritario'], popular: true },
      { name: 'Premium', price: '99€', desc: 'Para grandes centros', features: ['Todo en Pro', 'Profesionales ilimitados', 'Módulo laboratorio', 'Sincronización rayos X', 'API acceso', 'Soporte 24/7'], popular: false },
    ],
  },
  fisioterapia: {
    name: 'Nexora Fisioterapia', subtitle: 'Mapa de dolor y pautas de rehabilitación', desc: 'Plataforma dedicada a la rehabilitación con mapa de dolor, prescripción de ejercicio y bonos de sesiones.',
    color: '#0f172a',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para fisioterapeutas individuales', features: ['Hasta 50 pacientes', 'Agenda básica', 'Mapa de dolor', 'Bonos de sesiones', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para centros en crecimiento', features: ['Pacientes ilimitados', 'Agenda inteligente', 'Prescripción de ejercicio', 'Vídeos HD', '5 profesionales', 'Recordatorios', 'Soporte prioritario'], popular: true },
      { name: 'Premium', price: '99€', desc: 'Para centros grandes', features: ['Todo en Pro', 'Profesionales ilimitados', 'Informes biomecánicos', 'API acceso', 'Facturación avanzada', 'Soporte 24/7'] },
    ],
  },
  nutricion: {
    name: 'Nexora Nutrición', subtitle: 'Planes de dieta y seguimiento antropométrico', desc: 'Software para nutricionistas con diseñador de dietas IA y portal de recetas para pacientes.',
    color: '#059669',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para nutricionistas individuales', features: ['Hasta 50 pacientes', 'Agenda básica', 'Diseñador de dietas', 'Base de datos USDA', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para consultas en crecimiento', features: ['Pacientes ilimitados', 'Bioimpedancia integrada', 'Portal de recetas', '5 profesionales', 'Exportación PDF premium', 'Soporte prioritario'], popular: true },
      { name: 'Premium', price: '99€', desc: 'Para centros grandes', features: ['Todo en Pro', 'Profesionales ilimitados', 'Recordatorios hidratación', 'API acceso', 'Soporte 24/7'] },
    ],
  },
  psicologos: {
    name: 'Nexora Psicología', subtitle: 'Confidencialidad absoluta y notas dinámicas', desc: 'Entorno blindado para psicólogos con notas cifradas, teleconsulta HD y auto-registro del paciente.',
    color: '#7c3aed',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para psicólogos individuales', features: ['Hasta 50 pacientes', 'Agenda básica', 'Notas cifradas', 'Teleconsulta HD', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para consultas en crecimiento', features: ['Pacientes ilimitados', 'Auto-registro paciente', 'Escalas de ansiedad', '5 profesionales', 'Plantillas DSM-V', 'Soporte prioritario'], popular: true },
      { name: 'Premium', price: '99€', desc: 'Para centros grandes', features: ['Todo en Pro', 'Profesionales ilimitados', 'Cifrado AES-256', 'Gestión de grupos', 'API acceso', 'Soporte 24/7'] },
    ],
  },
  estetica: {
    name: 'Nexora Estética', subtitle: 'Control de tratamientos y galería fotográfica', desc: 'Plataforma para medicina estética con tracking fotográfico, trazabilidad de productos y CRM de fidelización.',
    color: '#db2777',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para profesionales individuales', features: ['Hasta 50 pacientes', 'Agenda básica', 'Tracking fotográfico', 'Firma consentimientos', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para clínicas en crecimiento', features: ['Pacientes ilimitados', 'Trazabilidad productos', 'CRM fidelización', '5 profesionales', 'Venta online', 'Soporte prioritario'], popular: true },
      { name: 'Premium', price: '99€', desc: 'Para centros premium', features: ['Todo en Pro', 'Profesionales ilimitados', 'Control aparatología', 'API acceso', 'Soporte 24/7'] },
    ],
  },
  general: {
    name: 'Nexora Clinical', subtitle: 'Sistema universal para múltiples especialidades', desc: 'Plataforma multi-especialidad para centros que combinan varias ramas clínicas.',
    color: '#5469d4',
    plans: [
      { name: 'Starter', price: '39€', desc: 'Para centros pequeños', features: ['Hasta 100 pacientes', 'Agenda básica', 'Historia clínica SOAP', 'Receta electrónica', 'Soporte email'] },
      { name: 'Pro', price: '79€', desc: 'Para centros en crecimiento', features: ['Pacientes ilimitados', 'Agenda inteligente', 'CIE-10', 'Gestión mutualidades', '10 profesionales', 'Soporte prioritario'], popular: true },
      { name: 'Premium', price: '149€', desc: 'Para grandes policlínicas', features: ['Todo en Pro', 'Profesionales ilimitados', 'Módulo enfermería', 'Interoperabilidad', 'API acceso', 'Soporte 24/7'] },
    ],
  },
};

export default function ContractPage() {
  const { specialty } = useParams();
  const navigate = useNavigate();
  const data = SAAS_DATA[specialty || ''];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">SaaS no encontrado</h1>
          <p className="text-slate-500 mb-6">El producto que buscas no está disponible.</p>
          <Link to="/" className="text-[#008477] font-medium hover:underline">Volver a Nexora</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#008477]/15 selection:text-[#008477]">
      <FrontendNavbar brandName={data.name} />

      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium mb-4" style={{ backgroundColor: `${data.color}15`, color: data.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.color }} />
              {data.subtitle}
            </div>
            <h1 className="text-[36px] sm:text-[44px] lg:text-[52px] leading-[1.05] font-semibold tracking-tight text-slate-900">
              Contrata {data.name}
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
              {data.desc}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Shield className="w-4 h-4" style={{ color: data.color }} /> Datos en UE · RGPD</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" style={{ color: data.color }} /> 14 días de prueba gratis</span>
            <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" style={{ color: data.color }} /> Sin límite de pacientes</span>
            <span className="inline-flex items-center gap-1.5"><CreditCard className="w-4 h-4" style={{ color: data.color }} /> Pago mensual sin permanencia</span>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-slate-50/60 border-y border-slate-200/70">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid md:grid-cols-3 gap-6">
            {data.plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 lg:p-8 rounded-2xl bg-white transition-all hover:shadow-lg ${
                  plan.popular ? 'ring-2 scale-[1.02] shadow-md' : 'ring-1 ring-slate-200/70'
                }`}
                style={plan.popular ? { boxShadow: `0 0 0 2px ${data.color}` } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: data.color }}>
                    Más popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-[14px] text-slate-500">/mes</span>
                </div>
                <p className="mt-2 text-[14px] text-slate-500">{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-slate-600">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: data.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(`/demo?specialty=${specialty}`)}
                  className={`mt-8 w-full h-12 rounded-xl text-[15px] font-semibold transition-all ${
                    plan.popular
                      ? 'text-white shadow-sm hover:brightness-110'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                  style={plan.popular ? { backgroundColor: data.color } : {}}
                >
                  Contratar ahora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-2xl bg-slate-900 px-8 py-14 lg:px-14 lg:py-20 text-center" style={{ backgroundColor: data.color }}>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
              ¿Prefieres una demo personalizada?
            </h2>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">
              Te enseñamos {data.name} con tus datos reales. Sin compromiso.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/demo?specialty=${specialty}`)}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-medium hover:bg-slate-100 transition-colors"
              >
                Solicitar demo <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg ring-1 ring-white/20 text-white text-[15px] font-medium hover:bg-white/5 transition-colors"
              >
                Ver todos los productos
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-slate-500">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <NexoraLogo size={20} />
            <span className="font-medium text-slate-700">{data.name}</span>
          </button>
          <span>© {new Date().getFullYear()} Nexora · Datos en la UE · RGPD</span>
        </div>
      </footer>
    </div>
  );
}
