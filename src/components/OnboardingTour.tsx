import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { title: 'Bienvenido a Nexora', description: 'Te guiaremos por los pasos básicos para configurar tu clínica en menos de 5 minutos.' },
  { title: 'Configura tu clínica', description: 'Ve a Configuración para añadir tu nombre, logo, horarios y especialidad.' },
  { title: 'Añade tu equipo', description: 'Invita a tus colegas desde la sección Personal y Turnos.' },
  { title: 'Crea servicios', description: 'Define tus tratamientos con precio y duración en la sección Servicios.' },
  { title: 'Agenda tu primera cita', description: 'Usa la Agenda para empezar a gestionar tus citas.' },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('onboarding_done') === 'true');

  if (dismissed) return null;

  const done = () => {
    localStorage.setItem('onboarding_done', 'true');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[#008477] p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">{STEPS[step].title}</h3>
          <button onClick={done} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">{STEPS[step].description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-[#008477]' : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="text-xs text-gray-400 flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Atrás</button>}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="text-xs font-semibold text-[#008477] flex items-center gap-1">Siguiente <ChevronRight className="w-3 h-3" /></button>
            ) : (
              <button onClick={done} className="text-xs font-semibold text-[#008477] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ¡Listo!</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
