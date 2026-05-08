import { HelpCircle, Bell, Grid, Plus } from 'lucide-react';

interface AutomationsViewProps {
  isDarkMode: boolean;
}

export default function AutomationsView({ isDarkMode }: AutomationsViewProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1440px] mx-auto pb-24 mt-8 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-[24px] font-bold tracking-tight mb-2 flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            <HelpCircle className="w-6 h-6 text-[#5469d4]" /> Automatizaciones Inteligentes
          </h1>
          <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Configura tus flujos automáticos potenciados por IA.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm">
          <Plus className="w-4 h-4" /> Nueva automatización
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className={`p-6 rounded-[8px] border relative transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#fcfdff] border-[#e3e8ee]'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a] text-green-400' : 'bg-[#f0f4f8] text-[#008477]'}`}>
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-[11px] font-bold rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>Activa</span>
              <div className={`w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${isDarkMode ? 'bg-green-500' : 'bg-[#008477]'}`}>
                <div className="w-3 h-3 rounded-full bg-white transform translate-x-4 shadow-sm"></div>
              </div>
            </div>
          </div>
          <h4 className={`text-[16px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Recordatorios de Citas por WhatsApp</h4>
          <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#8792a2]'}`}>Envía un mensaje inteligente 24 horas antes a los pacientes para reducir inasistencias.</p>

          <div className={`flex items-center justify-between pt-4 border-t text-[12px] ${isDarkMode ? 'border-[#334155] text-gray-400' : 'border-[#e3e8ee] text-[#4f566b]'}`}>
            <span>45 mensajes enviados hoy</span>
            <button className="font-medium text-[#5469d4] hover:underline">Configurar</button>
          </div>
        </div>

        <div className={`p-6 rounded-[8px] border relative transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#fcfdff] border-[#e3e8ee]'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a] text-blue-400' : 'bg-[#f0f4f8] text-[#5469d4]'}`}>
              <Grid className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-[11px] font-bold rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>Pausado</span>
              <div className={`w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
              </div>
            </div>
          </div>
          <h4 className={`text-[16px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Alerta de Solapamiento</h4>
          <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#8792a2]'}`}>El sistema revisa constantemente el cuadrante y te notifica si hay agendas superpuestas.</p>

          <div className={`flex items-center justify-between pt-4 border-t text-[12px] ${isDarkMode ? 'border-[#334155] text-gray-400' : 'border-[#e3e8ee] text-[#4f566b]'}`}>
            <span>0 alertas activas</span>
            <button className="font-medium text-[#5469d4] hover:underline">Configurar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
