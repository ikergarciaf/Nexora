import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, ArrowRight, ArrowLeft, Sparkles, Zap, Shield } from 'lucide-react';
import { FrontendNavbar } from '../components/FrontendNavbar';

const PLANS = [
  {
    name: 'Starter',
    desc: 'Para profesionales independientes que empiezan.',
    monthly: 29,
    yearly: 24,
    features: [
      'Citas ilimitadas',
      'Agenda y ficha clínica básica',
      'Recordatorios por email',
      '1 profesional',
      'Soporte estándar',
    ],
    cta: 'Empezar gratis',
    popular: false,
  },
  {
    name: 'Pro',
    desc: 'Para clínicas en crecimiento con varios profesionales.',
    monthly: 59,
    yearly: 49,
    features: [
      'Todo lo de Starter',
      'Hasta 5 profesionales',
      'IA generativa incluida',
      'Presupuestos y facturación',
      'Webhook y API',
      'Soporte prioritario',
    ],
    cta: 'Probar 14 días',
    popular: true,
  },
  {
    name: 'Enterprise',
    desc: 'Para grandes centros y grupos clínicos.',
    monthly: 119,
    yearly: 99,
    features: [
      'Todo el plan Pro',
      'Usuarios ilimitados',
      'Web médica personalizada',
      'SEO local premium',
      'SLA garantizado',
      'Soporte dedicado 24/7',
      'Migración asistida',
    ],
    cta: 'Contactar',
    popular: false,
  },
];

const FAQ = [
  { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, sin penalización. Conservas tus datos durante 30 días.' },
  { q: '¿Hay descuento por pago anual?', a: 'Sí, ahorras un 20% en todos los planes.' },
  { q: '¿Puedo cambiar de plan?', a: 'Sí, puedes subir o bajar de plan en cualquier momento.' },
  { q: '¿Aceptáis factura?', a: 'Sí, emitimos factura con IVA para todas las suscripciones.' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <FrontendNavbar />

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008477]/8 text-[#008477] text-[12px] font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Precios simples, sin sorpresas
            </div>
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">
              El plan perfecto para tu clínica
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Sin permanencia. Cancela cuando quieras. Todos los planes incluyen 14 días de prueba gratuita.
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="inline-flex p-1 rounded-lg bg-slate-100 ring-1 ring-slate-200/80">
              {(['monthly', 'yearly'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`h-9 px-5 rounded-md text-[13px] font-medium transition-colors ${
                    billing === b ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {b === 'monthly' ? 'Mensual' : 'Anual'}
                </button>
              ))}
            </div>
            <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100 px-2 py-1 rounded">
              Ahorra 20%
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-2xl bg-white ring-1 transition-all flex flex-col ${
                  plan.popular
                    ? 'ring-2 ring-[#008477] shadow-xl shadow-[#008477]/10 scale-[1.02]'
                    : 'ring-slate-200/70 hover:ring-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#008477] text-white text-[11px] font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Más popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-[13.5px] text-slate-500">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-slate-900">
                    {billing === 'monthly' ? plan.monthly : plan.yearly}€
                  </span>
                  <span className="text-[13px] text-slate-500">/mes</span>
                </div>
                <button
                  onClick={() => navigate(plan.name === 'Enterprise' ? '/demo?type=quote' : '/demo')}
                  className={`mt-6 h-12 rounded-xl text-[14px] font-medium transition-all ${
                    plan.popular
                      ? 'bg-[#008477] text-white hover:bg-[#007066] shadow-lg shadow-[#008477]/20'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </button>
                <ul className="mt-7 space-y-3.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-slate-600">
                      <Check className="w-4 h-4 mt-0.5 text-[#008477] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-24 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-center text-slate-900 mb-8">Preguntas frecuentes</h2>
            <div className="divide-y divide-slate-200/80 border-y border-slate-200/80">
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <button key={item.q} onClick={() => setOpenFaq(open ? null : i)} className="w-full text-left py-5 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 text-[15.5px]">{item.q}</div>
                      {open && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-[14px] text-slate-600 leading-relaxed">
                          {item.a}
                        </motion.p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-14 text-center">
            <h2 className="text-3xl font-semibold text-white">¿Tienes dudas?</h2>
            <p className="mt-3 text-slate-300 max-w-md mx-auto">
              Reserva una demo personalizada. Te enseñamos Nexora adaptado a tu especialidad.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/demo')} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors">
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/demo?type=quote')} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl ring-1 ring-white/20 text-white font-medium hover:bg-white/5 transition-colors">
                Contactar
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
