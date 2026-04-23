import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NexoraLogo } from '../components/NexoraLogo';
import { Calendar, Clock, User, CheckCircle2, Navigation, HeartPulse } from 'lucide-react';

export default function PublicBooking() {
  const { tenantId = 'demo-tenant' } = useParams();
  const [services, setServices] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({ patientName: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/booking/${tenantId}/services`)
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(console.error);
  }, [tenantId]);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for(let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        // skip weekends
        if (d.getDay() !== 0 && d.getDay() !== 6) {
            dates.push(d.toISOString().split('T')[0]);
        }
    }
    return dates;
  };

  const generateTimeSlots = () => {
    return ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '16:00', '16:30', '17:00'];
  };

  const activeDates = generateDates();
  const timeSlots = generateTimeSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/booking/${tenantId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: formData.patientName,
          email: formData.email,
          phone: formData.phone,
          serviceId: selectedService?.name,
          date: selectedDate,
          time: selectedTime
        })
      });
      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert('Hubo un error al confirmar la cita.');
      }
    } catch (e) {
      alert('Error de red al crear la cita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1: Pick Service
  // 2: Pick Date & Time
  // 3: Personal Details

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#fcfdff] font-sans flex flex-col items-center justify-center p-4">
         <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#e3e8ee] text-center p-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-[24px] font-bold text-[#1a1f36] mb-2">¡Reserva confirmada!</h2>
            <p className="text-[14px] text-[#4f566b] mb-8">
                Te esperamos el <strong className="text-[#1a1f36]">{new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> a las <strong className="text-[#1a1f36]">{selectedTime}</strong> para <strong className="text-[#1a1f36]">{selectedService.name}</strong>.
            </p>
            <div className="p-4 bg-[#f6f9fc] rounded-[8px] mb-8 text-left">
                <div className="flex items-start gap-3 mb-2">
                    <HeartPulse className="w-5 h-5 text-[#5469d4] shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[12px] font-bold text-[#4f566b] uppercase tracking-wider">Clínica</div>
                        <div className="text-[14px] font-medium text-[#1a1f36]">Clínica Nexora ({tenantId})</div>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-[#5469d4] shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[12px] font-bold text-[#4f566b] uppercase tracking-wider">Dirección</div>
                        <div className="text-[14px] font-medium text-[#1a1f36]">C/ Principal 123, Madrid, España</div>
                    </div>
                </div>
            </div>
            <p className="text-[12px] text-[#8792a2]">Te hemos enviado un correo de confirmación con los detalles y la política de cancelación.</p>
         </div>
         <div className="mt-8 flex items-center gap-2 opacity-50">
             <NexoraLogo size={20} /> <span className="font-bold text-[12px]">Motor de reservas by Nexora</span>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc] font-sans flex flex-col items-center py-12 px-4">
        {/* Header */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#e3e8ee] flex items-center justify-center">
                    <HeartPulse className="w-6 h-6 text-[#5469d4]" />
                </div>
                <div>
                   <h1 className="text-[20px] font-bold text-[#1a1f36]">Clínica Nexora ({tenantId})</h1>
                   <p className="text-[13px] text-[#4f566b]">Reserva tu cita online</p>
                </div>
            </div>
            <Link to="/login" className="text-[13px] font-bold text-[#5469d4] hover:underline">Acceso Profesional</Link>
        </div>

        {/* Content Box */}
        <div className="w-full max-w-3xl bg-white rounded-[16px] shadow-sm border border-[#e3e8ee] overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Col - Summary (Visible steps > 1) */}
            <div className={`w-full md:w-1/3 bg-[#fcfdff] border-r border-[#e3e8ee] p-6 transition-all ${step === 1 ? 'hidden md:block' : 'block'}`}>
                <h3 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider mb-6">Tu reserva</h3>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex flex-col text-[13px]">
                            <span className="text-[#8792a2] font-medium flex items-center gap-2 mb-1"><CheckCircle2 className={`w-4 h-4 ${selectedService ? 'text-green-500' : 'text-gray-300'}`} /> 1. Servicio</span>
                            {selectedService ? (
                                <span className="text-[#1a1f36] font-bold pl-6">{selectedService.name}</span>
                            ) : (
                                <span className="text-[#8792a2] pl-6">-</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col text-[13px]">
                            <span className="text-[#8792a2] font-medium flex items-center gap-2 mb-1"><CheckCircle2 className={`w-4 h-4 ${selectedDate && selectedTime ? 'text-green-500' : 'text-gray-300'}`} /> 2. Fecha y hora</span>
                            {selectedDate && selectedTime ? (
                                <span className="text-[#1a1f36] font-bold pl-6">{new Date(selectedDate).toLocaleDateString()} a las {selectedTime}</span>
                            ) : (
                                <span className="text-[#8792a2] pl-6">-</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col text-[13px]">
                            <span className="text-[#8792a2] font-medium flex items-center gap-2 mb-1"><CheckCircle2 className={`w-4 h-4 text-gray-300`} /> 3. Tus datos</span>
                            <span className="text-[#8792a2] pl-6">-</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Col - Steps */}
            <div className="w-full md:w-2/3 p-6 md:p-8">
                
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-[20px] font-bold text-[#1a1f36] mb-2">Selecciona un servicio</h2>
                        <p className="text-[14px] text-[#4f566b] mb-6">Elige el motivo de tu visita para ver la disponibilidad.</p>
                        
                        <div className="space-y-3">
                            {services.map(s => (
                                <button 
                                  key={s.id}
                                  onClick={() => { setSelectedService(s); setStep(2); }}
                                  className="w-full flex items-center justify-between p-4 border border-[#e3e8ee] rounded-[8px] hover:border-[#5469d4] hover:bg-[#f6f9fc] text-left transition-colors"
                                >
                                    <div>
                                        <h4 className="text-[15px] font-bold text-[#1a1f36]">{s.name}</h4>
                                        <p className="text-[13px] text-[#8792a2] mt-0.5">{s.duration} min</p>
                                    </div>
                                    <div className="text-[15px] font-bold text-[#5469d4]">
                                        {s.price === 0 ? 'Gratis' : `${s.price}€`}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                     <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <button onClick={() => setStep(1)} className="text-[13px] font-bold text-[#5469d4] hover:underline mb-4 inline-flex items-center gap-1">
                            &larr; Volver
                        </button>
                        <h2 className="text-[20px] font-bold text-[#1a1f36] mb-2">Selecciona fecha y hora</h2>
                        <p className="text-[14px] text-[#4f566b] mb-6">Consulta disponibilidad en tiempo real.</p>
                        
                        <div className="mb-6">
                            <h4 className="text-[13px] font-bold text-[#1a1f36] mb-3 flex items-center gap-2"><Calendar className="w-4 h-4"/> Días disponibles</h4>
                            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                                {activeDates.map(d => {
                                    const dateObj = new Date(d);
                                    const isSelected = selectedDate === d;
                                    return (
                                        <button 
                                          key={d}
                                          onClick={() => setSelectedDate(d)}
                                          className={`flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[80px] rounded-[12px] border transition-colors ${isSelected ? 'border-[#5469d4] bg-[#5469d4] text-white shadow-md' : 'border-[#e3e8ee] bg-white text-[#1a1f36] hover:border-[#5469d4] hover:bg-[#f6f9fc]'}`}
                                        >
                                            <span className="text-[11px] font-bold uppercase opacity-80">{dateObj.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                            <span className="text-[24px] font-bold">{dateObj.getDate()}</span>
                                            <span className="text-[11px] opacity-80">{dateObj.toLocaleDateString('es-ES', { month: 'short' })}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedDate && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h4 className="text-[13px] font-bold text-[#1a1f36] mb-3 flex items-center gap-2"><Clock className="w-4 h-4"/> Horas disponibles</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {timeSlots.map(t => {
                                        const isSelected = selectedTime === t;
                                        return (
                                            <button 
                                              key={t}
                                              onClick={() => setSelectedTime(t)}
                                              className={`py-2 text-[14px] font-bold rounded-[8px] border transition-colors ${isSelected ? 'border-[#5469d4] bg-[#5469d4] text-white shadow-sm' : 'border-[#e3e8ee] bg-white text-[#1a1f36] hover:border-[#5469d4] hover:bg-[#f6f9fc]'}`}
                                            >
                                                {t}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                           <button 
                             onClick={() => setStep(3)}
                             disabled={!selectedDate || !selectedTime}
                             className="w-full py-3 bg-[#1a1f36] text-white text-[15px] font-bold rounded-[8px] hover:opacity-90 transition-opacity disabled:opacity-50"
                           >
                              Continuar
                           </button>
                        </div>
                     </div>
                )}

                {step === 3 && (
                     <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <button onClick={() => setStep(2)} className="text-[13px] font-bold text-[#5469d4] hover:underline mb-4 inline-flex items-center gap-1">
                            &larr; Volver
                        </button>
                        <h2 className="text-[20px] font-bold text-[#1a1f36] mb-2">Tus datos personales</h2>
                        <p className="text-[14px] text-[#4f566b] mb-6">Necesitamos estos datos para confirmar tu reserva.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1a1f36] mb-1.5">Nombre completo *</label>
                                <input 
                                  type="text" 
                                  required
                                  value={formData.patientName}
                                  onChange={e => setFormData({...formData, patientName: e.target.value})}
                                  className="w-full px-4 py-2.5 border border-[#e3e8ee] rounded-[8px] text-[14px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                                  placeholder="Ej. María García"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1a1f36] mb-1.5">Correo electrónico *</label>
                                <input 
                                  type="email" 
                                  required
                                  value={formData.email}
                                  onChange={e => setFormData({...formData, email: e.target.value})}
                                  className="w-full px-4 py-2.5 border border-[#e3e8ee] rounded-[8px] text-[14px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                                  placeholder="Ej. maria@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1a1f36] mb-1.5">Teléfono *</label>
                                <input 
                                  type="tel" 
                                  required
                                  value={formData.phone}
                                  onChange={e => setFormData({...formData, phone: e.target.value})}
                                  className="w-full px-4 py-2.5 border border-[#e3e8ee] rounded-[8px] text-[14px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                                  placeholder="+34 600..."
                                />
                            </div>
                            
                            <div className="pt-4">
                                <button 
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="w-full py-3 bg-[#5469d4] text-white text-[15px] font-bold rounded-[8px] hover:bg-[#4c5ed1] transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                                >
                                   {isSubmitting ? 'Procesando reserva...' : 'Confirmar reserva'}
                                </button>
                                <p className="text-[11px] text-[#8792a2] mt-4 text-center">
                                    Al continuar, aceptas las políticas de cancelación de la clínica y los términos del servicio de Nexora.
                                </p>
                            </div>
                        </form>
                     </div>
                )}
            </div>
        </div>
        
        <div className="mt-12 flex items-center gap-2 opacity-50">
             <NexoraLogo size={20} /> <span className="font-bold text-[13px]">Powered by Nexora</span>
        </div>
    </div>
  );
}
