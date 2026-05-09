import { Download } from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsViewProps {
  isDarkMode: boolean;
}

const revenueData = [
  { name: 'Ene', ingresos: 4200, gastos: 2800 },
  { name: 'Feb', ingresos: 4800, gastos: 2900 },
  { name: 'Mar', ingresos: 5100, gastos: 3100 },
  { name: 'Abr', ingresos: 0, gastos: 3200 },
];

const serviceData = [
  { name: 'Limpieza', value: 45 },
  { name: 'Blanqueamiento', value: 25 },
  { name: 'Ortodoncia', value: 20 },
  { name: 'Otros', value: 10 },
];

export default function AnalyticsView({ isDarkMode }: AnalyticsViewProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12  pb-24 mt-8 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Análisis de Negocio</h1>
          <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Rendimiento financiero y operativo de tu clínica.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[4px] font-semibold text-[13px] transition-colors shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
            <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`} /> Informe Mensual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`rounded-[8px] p-6 border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155] shadow-lg shadow-black/20' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
          <h3 className={`text-[15px] font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Ingresos vs Gastos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f0f0f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8792a2'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8792a2'}} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e3e8ee',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    color: isDarkMode ? '#fff' : '#1a1f36'
                  }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#8792a2' }} />
                <Bar dataKey="ingresos" fill="#5469d4" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="gastos" fill="#80e9ff" radius={[4, 4, 0, 0]} barSize={24} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-[8px] p-6 border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155] shadow-lg shadow-black/20' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
          <h3 className={`text-[15px] font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Distribución por Servicio</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#5469d4', '#80e9ff', '#7a32fc', isDarkMode ? '#334155' : '#e3e8ee'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e3e8ee',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    color: isDarkMode ? '#fff' : '#1a1f36'
                  }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tasa de Conversión', value: '68%', trend: '+4%', color: 'text-green-500' },
          { label: 'Ticket Medio', value: '142€', trend: '+12€', color: 'text-green-500' },
          { label: 'Nuevos Pacientes (Mes)', value: '18', trend: '-2', color: 'text-red-500' }
        ].map((stat, i) => (
          <div key={i} className={`rounded-[8px] p-5 border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155] shadow-lg shadow-black/10' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
            <div className={`text-[13px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{stat.label}</div>
            <div className="flex items-end justify-between">
              <div className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stat.value}</div>
              <div className={`text-[12px] font-bold ${stat.color}`}>{stat.trend}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
