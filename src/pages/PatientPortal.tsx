import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ChevronLeft, XCircle, Loader2, User, Phone, Mail, CheckCircle2 } from 'lucide-react';

export default function PatientPortal() {
  const { slug, patientId } = useParams<{ slug: string; patientId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !patientId) return;
    setLoading(true);
    fetch(`/api/public/${slug}/portal/${patientId}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Error al cargar portal'))
      .finally(() => setLoading(false));
  }, [slug, patientId]);

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    setCancelling(appointmentId);
    try {
      const res = await fetch(`/api/public/${slug}/portal/${patientId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          upcomingAppointments: prev.upcomingAppointments.filter((a: any) => a.id !== appointmentId),
        }));
      }
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  if (!slug || !patientId) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Enlace inválido</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f9fc] to-[#e8f4f8]">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#008477] font-medium text-sm mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Nexora
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#008477]" /></div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">{error}</div>
        ) : data && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-1">Hola, {data.patient.fullName}</h2>
              <p className="text-sm text-gray-400">{data.clinicName}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#008477]" /> Próximas citas</h3>
              {data.upcomingAppointments.length === 0 ? (
                <p className="text-gray-400 text-sm">No tienes citas próximas</p>
              ) : (
                <div className="space-y-3">
                  {data.upcomingAppointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-700">{formatDate(apt.startTime)}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(apt.startTime)}</p>
                      </div>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={cancelling === apt.id}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium"
                      >
                        {cancelling === apt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Historial de citas</h3>
              {data.pastAppointments.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay citas pasadas</p>
              ) : (
                <div className="space-y-2">
                  {data.pastAppointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm text-gray-600">{formatDate(apt.startTime)}</p>
                        <p className="text-xs text-gray-400">{formatTime(apt.startTime)}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${apt.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' : apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {apt.status === 'SCHEDULED' ? 'Programada' : apt.status === 'COMPLETED' ? 'Completada' : apt.status === 'CANCELLED' ? 'Cancelada' : apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-700 mb-3">Tus datos</h3>
              <div className="space-y-2 text-sm">
                {data.patient.email && <p className="flex items-center gap-2 text-gray-500"><Mail className="w-3.5 h-3.5" />{data.patient.email}</p>}
                {data.patient.phone && <p className="flex items-center gap-2 text-gray-500"><Phone className="w-3.5 h-3.5" />{data.patient.phone}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
