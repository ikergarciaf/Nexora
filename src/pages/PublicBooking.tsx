import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, Loader2, User, Phone, Mail } from 'lucide-react';

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [clinic, setClinic] = useState<any>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [step, setStep] = useState<'slots' | 'form' | 'done'>('slots');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const dateStr = selectedDate.toISOString().slice(0, 10);
    fetch(`/api/public/${slug}/slots?date=${dateStr}`)
      .then(r => r.json())
      .then(data => { setClinic(data.clinic); setSlots(data.slots); })
      .catch(() => setError('Error al cargar horarios'))
      .finally(() => setLoading(false));
  }, [slug, selectedDate]);

  const handleBook = async () => {
    if (!form.fullName.trim()) { setError('El nombre es obligatorio'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`/api/public/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: selectedSlot, fullName: form.fullName, email: form.email, phone: form.phone }),
      });
      if (!res.ok) { const err = await res.json(); setError(err.error || 'Error al reservar'); setSubmitting(false); return; }
      const data = await res.json();
      setPatientId(data.appointment.patientId);
      setStep('done');
    } catch { setError('Error de conexión'); }
    setSubmitting(false);
  };

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); setSelectedSlot(''); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); setSelectedSlot(''); };

  const formatDate = (d: Date) => d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = selectedDate.toDateString() === today.toDateString();

  if (!slug) return <div className="p-8 text-center text-gray-500">Enlace inválido</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f9fc] to-[#e8f4f8] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {clinic && (
          <div className="bg-[#008477] p-6 text-white text-center">
            {clinic.logoUrl && <img src={clinic.logoUrl} alt={clinic.name} className="h-12 mx-auto mb-2" />}
            <h1 className="text-xl font-bold">{clinic.name}</h1>
            <p className="text-sm opacity-80">{clinic.specialty}</p>
          </div>
        )}

        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          {step === 'slots' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedDate)}
                </div>
                <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#008477]" /></div>
              ) : slots.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No hay horarios disponibles para este día</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(s => (
                    <button key={s} onClick={() => setSelectedSlot(s)}
                      className={`p-3 rounded-lg text-sm font-medium border transition-all ${selectedSlot === s ? 'bg-[#008477] text-white border-[#008477]' : 'border-gray-200 text-gray-600 hover:border-[#008477] hover:text-[#008477]'}`}>
                      <Clock className="w-3.5 h-3.5 inline mr-1" />{formatTime(s)}
                    </button>
                  ))}
                </div>
              )}

              {selectedSlot && (
                <button onClick={() => setStep('form')} className="w-full mt-6 bg-[#008477] text-white py-3 rounded-lg font-semibold hover:bg-[#006b5f] transition-colors">
                  Continuar — {formatTime(selectedSlot)}
                </button>
              )}
            </>
          )}

          {step === 'form' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-700">Tus datos</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1"><User className="w-3.5 h-3.5 inline mr-1" />Nombre completo *</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008477] focus:border-transparent outline-none" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1"><Mail className="w-3.5 h-3.5 inline mr-1" />Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008477] focus:border-transparent outline-none" placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1"><Phone className="w-3.5 h-3.5 inline mr-1" />Teléfono</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008477] focus:border-transparent outline-none" placeholder="+34 600 000 000" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('slots')} className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">Atrás</button>
                <button onClick={handleBook} disabled={submitting} className="flex-1 bg-[#008477] text-white py-3 rounded-lg font-semibold hover:bg-[#006b5f] disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar cita'}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-[#008477] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-700 mb-2">Cita confirmada</h2>
              <p className="text-gray-500 mb-1">Hemos registrado tu cita correctamente.</p>
              {form.email && <p className="text-sm text-gray-400">Te hemos enviado un email de confirmación.</p>}
              {patientId && (
                <a href={`/portal/${slug}/${patientId}`} className="mt-4 inline-block text-[#008477] font-medium text-sm hover:underline">
                  Gestionar mis citas →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
