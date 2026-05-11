import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Clock, Users, CreditCard } from 'lucide-react';
import { useModal } from '../ModalContext';

const SAAS_DATA: Record<string, { name: string; subtitle: string; desc: string; color: string; plans: { name: string; price: string; desc: string; features: string[]; popular?: boolean }[] }> = {
  dental: {
    name: 'Nexora Dental', subtitle: 'Odontograma digital y presupuestos por fases', desc: 'Gestiona tu clínica dental con herramientas específicas.',
    color: '#008477',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para profesionales independientes', features: ['Gestión de pacientes ilimitada', 'Agenda inteligente', 'Odontograma digital', 'Historial clínico', 'Recordatorios automáticos', '1 profesional', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para clínicas en crecimiento', features: ['Todo lo de Starter', 'Hasta 5 profesionales', 'IA generativa (resúmenes)', 'Asistente IA en WhatsApp', 'Presupuestos por fases', 'Firma digital consentimientos', 'Facturación + Stripe', 'Soporte prioritario'], popular: true },
      { name: 'Web Pro', price: '89€', desc: 'Todo incluido + web médica', features: ['Todo lo de Pro', 'Profesionales ilimitados', 'Web médica personalizada', 'Reserva online pública', 'SEO local', 'Portal del paciente', 'Panel de insights', 'Soporte dedicado 24/7'] },
    ],
  },
  fisioterapia: {
    name: 'Nexora Fisioterapia', subtitle: 'Mapa de dolor y pautas de rehabilitación', desc: 'Plataforma dedicada a la rehabilitación.',
    color: '#0f172a',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para fisioterapeutas individuales', features: ['Gestión de pacientes ilimitada', 'Agenda inteligente', 'Mapa de dolor', 'Bonos de sesiones', 'Historial clínico', '1 profesional', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para centros en crecimiento', features: ['Todo lo de Starter', 'Hasta 5 profesionales', 'IA generativa (resúmenes)', 'Prescripción de ejercicio', 'Vídeos HD', 'Recordatorios WhatsApp', 'Facturación + Stripe', 'Soporte prioritario'], popular: true },
      { name: 'Web Pro', price: '89€', desc: 'Todo incluido + web médica', features: ['Todo lo de Pro', 'Profesionales ilimitados', 'Web médica personalizada', 'Reserva online pública', 'SEO local', 'Portal del paciente', 'Panel de insights', 'Soporte dedicado 24/7'] },
    ],
  },
  nutricion: {
    name: 'Nexora Nutrición', subtitle: 'Planes de dieta y seguimiento antropométrico', desc: 'Software para nutricionistas con diseñador de dietas IA.',
    color: '#059669',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para nutricionistas individuales', features: ['Gestión de pacientes ilimitada', 'Agenda inteligente', 'Diseñador de dietas IA', 'Base de datos nutricional', 'Historial clínico', '1 profesional', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para consultas en crecimiento', features: ['Todo lo de Starter', 'Hasta 5 profesionales', 'IA generativa (resúmenes)', 'Bioimpedancia integrada', 'Portal de recetas', 'Recordatorios WhatsApp', 'Facturación + Stripe', 'Soporte prioritario'], popular: true },
      { name: 'Web Pro', price: '89€', desc: 'Todo incluido + web médica', features: ['Todo lo de Pro', 'Profesionales ilimitados', 'Web médica personalizada', 'Reserva online pública', 'SEO local', 'Portal del paciente', 'Panel de insights', 'Soporte dedicado 24/7'] },
    ],
  },
  psicologos: {
    name: 'Nexora Psicología', subtitle: 'Confidencialidad absoluta y notas dinámicas', desc: 'Entorno blindado para psicólogos.',
    color: '#7c3aed',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para psicólogos individuales', features: ['Gestión de pacientes ilimitada', 'Agenda inteligente', 'Notas cifradas', 'Teleconsulta HD', 'Historial clínico', '1 profesional', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para consultas en crecimiento', features: ['Todo lo de Starter', 'Hasta 5 profesionales', 'IA generativa (resúmenes)', 'Auto-registro paciente', 'Escalas psicométricas', 'Recordatorios WhatsApp', 'Facturación + Stripe', 'Soporte prioritario'], popular: true },
      { name: 'Web Pro', price: '89€', desc: 'Todo incluido + web médica', features: ['Todo lo de Pro', 'Profesionales ilimitados', 'Web médica personalizada', 'Reserva online pública', 'SEO local', 'Portal del paciente', 'Panel de insights', 'Soporte dedicado 24/7'] },
    ],
  },
  estetica: {
    name: 'Nexora Estética', subtitle: 'Control de tratamientos y galería fotográfica', desc: 'Plataforma para medicina estética.',
    color: '#db2777',
    plans: [
      { name: 'Starter', price: '29€', desc: 'Para profesionales individuales', features: ['Gestión de pacientes ilimitada', 'Agenda inteligente', 'Tracking fotográfico', 'Firma consentimientos', 'Historial clínico', '1 profesional', 'Soporte email'] },
      { name: 'Pro', price: '59€', desc: 'Para clínicas en crecimiento', features: ['Todo lo de Starter', 'Hasta 5 profesionales', 'IA generativa (resúmenes)', 'Trazabilidad productos', 'CRM fidelización', 'Recordatorios WhatsApp', 'Facturación + Stripe', 'Soporte prioritario'], popular: true },
      { name: 'Web Pro', price: '89€', desc: 'Todo incluido + web médica', features: ['Todo lo de Pro', 'Profesionales ilimitados', 'Web médica personalizada', 'Reserva online pública', 'SEO local', 'Portal del paciente', 'Panel de insights', 'Soporte dedicado 24/7'] },
    ],
  },
  general: {
    name: 'Nexora Clinical', subtitle: 'Sistema universal para múltiples especialidades', desc: 'Plataforma multi-especialidad.',
    color: '#5469d4',
    plans: [
      { name: 'Starter', price: '39€', desc: 'Para centros pequeños', features: ['Gestión de pacientes ilimitada', 'Agenda inteligente', 'Historia clínica SOAP', 'Receta electrónica', 'CIE-10', '1 profesional', 'Soporte email'] },
      { name: 'Pro', price: '79€', desc: 'Para centros en crecimiento', features: ['Todo lo de Starter', 'Hasta 10 profesionales', 'IA generativa (resúmenes)', 'Gestión mutualidades', 'Interoperabilidad', 'Recordatorios WhatsApp', 'Facturación + Stripe', 'Soporte prioritario'], popular: true },
      { name: 'Premium', price: '149€', desc: 'Para grandes policlínicas', features: ['Todo lo de Pro', 'Profesionales ilimitados', 'Módulo enfermería', 'Web médica personalizada', 'Reserva online pública', 'API acceso', 'Panel de insights', 'Soporte dedicado 24/7'] },
    ],
  },
};

interface ContractFormProps {
  initialData?: Record<string, string>;
}

export default function ContractForm({ initialData = {} }: ContractFormProps) {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const specialty = initialData.specialty || 'dental';
  const data = SAAS_DATA[specialty];

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">Producto no encontrado</h2>
        <p className="text-slate-500 mt-2">El producto que buscas no está disponible.</p>
      </div>
    );
  }

  const planToKey = (name: string): string => {
    if (name === 'Pro') return 'PRO';
    if (name === 'Web Pro' || name === 'Premium') return 'PREMIUM';
    return 'STARTER';
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium mb-3" style={{ backgroundColor: `${data.color}15`, color: data.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.color }} />
          {data.subtitle}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Contrata {data.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{data.desc}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" style={{ color: data.color }} /> Datos UE · RGPD</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" style={{ color: data.color }} /> 14 días gratis</span>
          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" style={{ color: data.color }} /> Sin límite pacientes</span>
          <span className="inline-flex items-center gap-1"><CreditCard className="w-3 h-3" style={{ color: data.color }} /> Sin permanencia</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-4 rounded-xl transition-all ${plan.popular ? 'ring-2 shadow-sm' : 'ring-1 ring-slate-200/70'}`}
            style={plan.popular ? { boxShadow: `0 0 0 2px ${data.color}20` } : {}}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: data.color }}>
                Más popular
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-[12px] text-slate-500">/mes</span>
              </div>
            </div>
            <p className="text-[13px] text-slate-500 mb-3">{plan.desc}</p>
            <ul className="space-y-1.5 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-slate-600">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: data.color }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openModal('demo', { plan: planToKey(plan.name), specialty })}
              className={`w-full h-10 rounded-lg text-[13px] font-semibold transition-all ${
                plan.popular
                  ? 'text-white shadow-sm hover:brightness-110'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
              style={plan.popular ? { backgroundColor: data.color } : {}}
            >
              Comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
