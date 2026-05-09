import { BarChart, HelpCircle, Bell, CheckCircle2, Package, ArrowRight } from 'lucide-react';

interface InsightsViewProps {
  isDarkMode: boolean;
}

export default function InsightsView({ isDarkMode }: InsightsViewProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12  pb-24 mt-8 transition-colors">
      <div className="mb-8">
        <h1 className={`text-[24px] font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
          <span className={`w-8 h-8 rounded-[4px] flex items-center justify-center transition-colors ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#f0f4ff] text-[#5469d4]'}`}>
            <BarChart className="w-5 h-5" />
          </span>
          Insights Avanzados
        </h1>
        <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Análisis predictivo de AI sobre tu base de datos.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">

        <div className={`rounded-[12px] p-6 relative overflow-hidden transition-all border ${isDarkMode ? 'bg-[#1e293b] border-blue-500/50 shadow-xl shadow-blue-500/10' : 'bg-[#fcfdff] border-[#5469d4]/30 shadow-sm'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <HelpCircle className={`w-32 h-32 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </div>
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 shadow-sm ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-[#5469d4] text-white'}`}>
              <Bell className="w-3 h-3" /> Prioridad Alta
            </div>
            <h3 className={`text-[20px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Optimización de Agenda Predictiva</h3>
            <p className={`text-[14px] max-w-2xl mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>
              El sistema ha detectado que los martes de 10:00 a 12:00 tienen una tasa de cancelación un 35% superior a la media.
              Sugerimos implementar recordatorios automáticos de WhatsApp 4 horas antes para este intervalo.
            </p>
            <div className="flex gap-3">
              <button className="px-5 py-2 bg-[#5469d4] text-white rounded-[4px] font-bold text-[13px] hover:bg-[#4c5ed1] transition-all shadow-md active:scale-95">
                Aplicar Automáticamente
              </button>
              <button className={`px-5 py-2 rounded-[4px] font-bold text-[13px] transition-all border ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white hover:bg-[#1e293b]' : 'bg-white border-[#e3e8ee] text-[#4f566b] hover:bg-[#f6f9fc]'}`}>
                Ver detalles
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-[8px] p-6 border transition-all ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Potencial de Fidelización</h4>
            </div>
            <p className={`text-[13px] leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
              Hay 24 clientes que no han tenido una revisión en los últimos 12 meses. Tu "Lifetime Value" proyectado podría aumentar un 14% si recuperas al menos el 20% de ellos.
            </p>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-[#f6f9fc]'}`}>
              <div className="bg-green-500 h-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between mt-2 text-[11px] font-medium text-[#8792a2]">
              <span>Retención Actual: 65%</span>
              <span>Objetivo AI: 80%</span>
            </div>
          </div>

          <div className={`rounded-[8px] p-6 border transition-all ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <Package className="w-5 h-5" />
              </div>
              <h4 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Tendencias de Tratamiento</h4>
            </div>
            <p className={`text-[13px] leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
              La demanda de Blanqueamiento Dental ha crecido un 42% en el último trimestre. Considera crear un pack de "Higiene + Blanqueamiento" para maximizar ingresos.
            </p>
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-[11px] font-semibold rounded-[4px] ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>Estética</span>
              <span className={`px-2 py-1 text-[11px] font-semibold rounded-[4px] ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>Alta demanda</span>
            </div>
          </div>
        </div>

        <div className={`rounded-[8px] p-6 shadow-lg transition-colors ${isDarkMode ? 'bg-[#0f172a] shadow-black/40 border border-blue-500/20' : 'bg-[#1a1f36]'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5469d4] flex items-center justify-center font-bold text-[12px] text-white">NX</div>
              <div>
                <h4 className="text-[15px] font-bold text-white">Asistente AI Chat</h4>
                <span className="text-[11px] text-[#8792a2]">Consultoría de Negocio 24/7</span>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div className="bg-[#2d334d] p-3 rounded-[8px] text-[13px] max-w-[80%] border-l-4 border-[#5469d4] text-white">
              ¿Cómo puedo ayudarte a mejorar la rentabilidad de tu clínica hoy?
            </div>
            <div className="bg-[#5469d4] p-3 rounded-[8px] text-[13px] max-w-[80%] ml-auto text-right text-white">
              Muéstrame los pacientes con mayor riesgo de abandono.
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Pregunta a la IA..."
              className={`flex-1 border-none outline-none px-4 py-2 rounded-[4px] text-[13px] placeholder:text-[#8792a2] transition-colors ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-[#2d334d] text-white'}`}
            />
            <button className="p-2 bg-[#5469d4] rounded-[4px] hover:bg-[#4c5ed1] transition-colors">
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
