import { Phone, Info, Rocket } from 'lucide-react';

interface WhatsAppBotViewProps {
  isDarkMode: boolean;
  clinicConfig: any;
}

export default function WhatsAppBotView({ isDarkMode, clinicConfig }: WhatsAppBotViewProps) {
  return (
    <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
      <div className="mb-8">
        <h1 className={`text-[24px] font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
          <Phone className="w-6 h-6 text-[#25D366]" /> Gestión WhatsApp AI Bot
        </h1>
        <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Configura tu asistente automático para agendar citas por WhatsApp.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-[17px] font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                Estado del Bot
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVO</span>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4" /> ¿Cómo funciona?
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Cuando un paciente escribe a tu número de WhatsApp, Nexora AI entiende si quiere una cita y le ofrece los huecos libres según tu calendario de "Agenda".
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <div>
                    <div className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Agendamiento Automático</div>
                    <div className="text-[12px] text-gray-400">Permitir que el bot reserve citas directamente en la agenda.</div>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-[#25D366] relative">
                    <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <div>
                    <div className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Notificaciones de Cancelación</div>
                    <div className="text-[12px] text-gray-400">Enviar aviso por WhatsApp cuando el bot detecte una cancelación.</div>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-gray-300 relative">
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <h3 className={`text-[17px] font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Instrucciones de Personalización</h3>
            <p className="text-sm text-gray-500 mb-4">Puedes dar "instrucciones extra" a tu bot para que sepa cómo responder a ciertas preguntas (ej. "No aceptamos Adeslas").</p>
            <textarea
              className={`w-full p-4 border rounded-xl text-sm outline-none ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`}
              placeholder="Ej. Si preguntan por seguros, diles que solo trabajamos con Sanitas y Mapfre..."
              rows={4}
            />
            <button className="mt-4 px-6 py-2 bg-[#25D366] text-white rounded-xl font-bold hover:brightness-90 transition-all">
              Guardar Instrucciones
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#075e54] to-[#128c7e] p-6 rounded-[20px] text-white shadow-xl shadow-green-900/10">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Rocket className="w-5 h-5" /> Pruébalo ahora
            </h4>
            <p className="text-xs opacity-90 mb-6">Hemos habilitado una demo interactiva donde puedes simular ser un paciente escribiéndole a tu propia clínica.</p>
            <button
              onClick={() => window.open(`/whatsapp-demo?slug=${clinicConfig.slug || 'demo'}`)}
              className="w-full py-3 bg-white text-[#075e54] rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> Abrir Chat Demo
            </button>
          </div>

          <div className={`border rounded-[12px] p-6 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <h4 className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Estadísticas del Bot</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Conversaciones hoy</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Citas agendadas (Bot)</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Ahorro tiempo est.</span>
                <span className="text-sm font-bold text-green-500">1.5h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
