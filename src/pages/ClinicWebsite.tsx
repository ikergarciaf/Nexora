import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Phone, Mail, Clock, ArrowRight, CheckCircle2, Stethoscope, Shield, Star } from 'lucide-react';

interface ClinicData {
  name: string;
  slug: string;
  description: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  specialty: string;
  openingHours: { day: string; open: string; close: string; closed: boolean }[];
  logoUrl: string;
  themeColor: string;
}

export default function ClinicWebsite() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/clinic/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setClinic(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008477]" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Clínica no encontrada</h1>
          <p className="text-slate-500 mb-6">La clínica que buscas no está disponible.</p>
          <a href="/" className="text-[#008477] font-medium hover:underline">Volver a Nexora</a>
        </div>
      </div>
    );
  }

  const themeColor = clinic.themeColor || '#008477';

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {clinic.logoUrl ? (
              <img src={clinic.logoUrl} alt={clinic.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: themeColor }}>
                {clinic.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-[17px] tracking-tight text-slate-900">{clinic.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${clinic.contactPhone}`} className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-slate-900 text-white text-[14px] font-medium hover:bg-[#008477] transition-colors">
              <Phone className="w-4 h-4" /> Llamar
            </a>
            <a href="#" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white text-slate-700 text-[14px] font-medium ring-1 ring-slate-200 hover:ring-slate-300 transition-colors">
              <Calendar className="w-4 h-4" /> Reservar cita
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium mb-4" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                {clinic.specialty}
              </div>
              <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
                {clinic.name}
              </h1>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                {clinic.description || 'Tu salud es nuestra prioridad. Tecnología médica avanzada al servicio de nuestros pacientes.'}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-white text-[15px] font-medium transition-colors" style={{ backgroundColor: themeColor }}>
                  Pedir cita online <ArrowRight className="w-4 h-4" />
                </a>
                <a href={`tel:${clinic.contactPhone}`} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-700 text-[15px] font-medium ring-1 ring-slate-200 hover:ring-slate-300 transition-colors">
                  <Phone className="w-4 h-4" /> {clinic.contactPhone}
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{ color: themeColor }} /> Reserva online</span>
                <span className="inline-flex items-center gap-1.5"><Shield className="w-4 h-4" style={{ color: themeColor }} /> Datos seguros</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-x-4 -inset-y-4 rounded-[32px] blur-2xl opacity-30" style={{ backgroundColor: themeColor }} />
              <div className="relative aspect-[4/3] rounded-2xl bg-slate-100 ring-1 ring-slate-200/70 overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <Stethoscope className="w-16 h-16 mx-auto mb-4" style={{ color: themeColor }} />
                  <p className="text-slate-400 text-sm">{clinic.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="py-16 bg-slate-50/60 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white ring-1 ring-slate-200/70">
              <MapPin className="w-5 h-5 mb-3" style={{ color: themeColor }} />
              <h3 className="font-semibold text-slate-900 mb-1">Dirección</h3>
              <p className="text-sm text-slate-500">{clinic.address || 'Dirección no disponible'}</p>
            </div>
            <div className="p-6 rounded-xl bg-white ring-1 ring-slate-200/70">
              <Clock className="w-5 h-5 mb-3" style={{ color: themeColor }} />
              <h3 className="font-semibold text-slate-900 mb-1">Horario</h3>
              <div className="text-sm text-slate-500 space-y-0.5">
                {clinic.openingHours?.slice(0, 5).map((h) => (
                  <div key={h.day} className="flex justify-between">
                    <span>{h.day}</span>
                    <span>{h.closed ? 'Cerrado' : `${h.open} - ${h.close}`}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white ring-1 ring-slate-200/70">
              <Phone className="w-5 h-5 mb-3" style={{ color: themeColor }} />
              <h3 className="font-semibold text-slate-900 mb-1">Contacto</h3>
              <div className="space-y-1 text-sm">
                <a href={`tel:${clinic.contactPhone}`} className="block text-slate-500 hover:text-[#008477]">{clinic.contactPhone || 'No disponible'}</a>
                <a href={`mailto:${clinic.contactEmail}`} className="block text-slate-500 hover:text-[#008477]">{clinic.contactEmail || 'No disponible'}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">¿Listo para tu visita?</h2>
          <p className="mt-3 text-slate-500">Reserva tu cita online de forma rápida y sencilla.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-white text-[15px] font-medium transition-colors" style={{ backgroundColor: themeColor }}>
              Pedir cita ahora <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-slate-400">
          <span>© {new Date().getFullYear()} {clinic.name}. Todos los derechos reservados.</span>
          <span>Powered by <a href="/" className="text-[#008477] font-medium hover:underline">Nexora</a></span>
        </div>
      </footer>
    </div>
  );
}
