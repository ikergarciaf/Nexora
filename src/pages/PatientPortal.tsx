import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, FileText, CheckCircle2, Clock, AlertCircle, Phone, MapPin } from 'lucide-react';
import { NexoraLogo } from '../components/NexoraLogo';

export default function PatientPortal() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const response = await fetch(`/api/portal/access/${token}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to load portal data');
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008477]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace Inválido</h1>
        <p className="text-gray-500 max-w-md">{error || 'El acceso a este portal médico no es válido o ha expirado. Por favor, contacta a tu clínica para obtener un nuevo enlace.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NexoraLogo size={28} />
            <span className="font-bold text-xl text-[#008477]">Portal del Paciente</span>
          </div>
          <div className="text-sm font-medium text-gray-500 hidden sm:block">
            Acceso Seguro
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Hola, {data.patientInfo.fullName.split(' ')[0]}
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Bienvenido a tu espacio personal. Aquí puedes consultar tus próximas citas, historial y documentos clínicos de forma totalmente segura.
              </p>
            </div>
            <div className="flex gap-3">
               {/* Contact Clinic placeholders */}
               <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors">
                 <Phone size={16} /> Contactar
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors">
                 <MapPin size={16} /> Cómo llegar
               </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content - Appointments */}
          <div className="md:col-span-2 space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#008477]" /> 
                Mis Citas
              </h2>
              
              {data.appointments.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">No hay citas programadas</h3>
                  <p className="text-sm text-gray-500 mt-1">Actualmente no tienes citas futuras en tu calendario.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.appointments.map((apt: any) => (
                    <div key={apt.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-emerald-50 text-[#008477] w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold">
                          <span className="text-xs uppercase">{new Date(apt.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                          <span className="text-lg leading-none">{new Date(apt.date).getDate()}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{apt.type}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {apt.status === 'COMPLETED' && <CheckCircle2 size={12} />}
                          {apt.status === 'SCHEDULED' ? 'Programada' : apt.status === 'COMPLETED' ? 'Completada' : apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar - Invoices & Documents */}
          <div className="space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#008477]" /> 
                Facturas y Recibos
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {data.invoices.length === 0 ? (
                  <div className="p-6 text-center">
                     <p className="text-sm text-gray-500">No hay facturas disponibles.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {data.invoices.map((inv: any) => (
                      <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="font-medium text-sm text-gray-900">Factura #{inv.id.substring(0, 5)}</div>
                          <div className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString('es-ES')}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#008477]">€{inv.amount}</span>
                          <button className="text-[#008477] hover:underline text-xs font-medium">Descargar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          </div>

        </div>
      </main>
    </div>
  );
}
