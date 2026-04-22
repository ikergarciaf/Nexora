import React, { useState } from 'react';
import { 
  Home, Wallet, ArrowRightLeft, Users, Package, CreditCard, FileText, BarChart, MoreHorizontal, 
  Code, Search, Grid, HelpCircle, Bell, Settings, Plus, ChevronDown, CheckCircle2, Info, X, Map
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';

export default function Dashboard() {
  const { stats, appointments } = useDashboardData();
  
  // Formatters
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  
  return (
    <div className="flex flex-col h-screen w-full bg-[#f6f9fc] text-[#425466] font-sans overflow-hidden">
      
      {/* Top Banner (Test Mode) */}
      <div className="bg-[#e3e8ee] text-[#1a1f36] px-4 py-1.5 flex items-center justify-between text-xs font-medium border-b border-[#e3e8ee] shrink-0">
        <div className="flex items-center gap-1.5">
          <span>Entorno de prueba</span>
          <Info className="w-3.5 h-3.5 text-[#4f566b]" />
        </div>
        <div className="flex-1 text-center text-[#4f566b] hidden sm:block">
          Estás realizando pruebas en un entorno de prueba. Los cambios que realices aquí no afectarán a tu cuenta activa.
        </div>
        <button className="bg-[#5469d4] hover:bg-[#4c5ed1] text-white px-3 py-1 rounded-[4px] font-semibold transition-colors shadow-sm">
          Cambiar a la cuenta activa
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#f6f9fc] border-r border-[#e3e8ee] flex flex-col shrink-0 overflow-y-auto hidden md:flex">
          {/* Account Selector */}
          <div className="p-4 pt-5">
            <button className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#e3e8ee] rounded-[4px] transition-colors">
              <div className="flex items-center gap-2 text-left">
                <div className="w-6 h-6 bg-white border border-[#e3e8ee] rounded text-[#1a1f36] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  N
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#1a1f36] leading-tight flex items-center gap-1">
                    Nexus <ChevronDown className="w-3 h-3 text-[#8792a2]" />
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-0.5 mt-2">
            <a href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] bg-[#e3e8ee] text-[#000000] font-semibold text-[13px]">
              <Home className="w-4 h-4 text-[#5469d4]" />
              Inicio
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee] font-medium text-[13px] transition-colors">
              <Wallet className="w-4 h-4 text-[#8792a2]" />
              Saldos
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee] font-medium text-[13px] transition-colors">
              <ArrowRightLeft className="w-4 h-4 text-[#8792a2]" />
              Transacciones
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee] font-medium text-[13px] transition-colors">
              <Users className="w-4 h-4 text-[#8792a2]" />
              Clientes
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee] font-medium text-[13px] transition-colors">
              <Package className="w-4 h-4 text-[#8792a2]" />
              Catálogo de productos
            </a>

            <div className="mt-8 mb-2 px-3 text-[11px] font-bold text-[#8792a2] uppercase tracking-wider">Productos</div>
            <a href="#" className="flex items-center justify-between px-3 py-1.5 rounded-[4px] text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee] font-medium text-[13px] transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-[#8792a2]" />
                Payments
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="flex items-center justify-between px-3 py-1.5 rounded-[4px] text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee] font-medium text-[13px] transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#8792a2]" />
                Billing
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="flex items-center justify-between px-3 py-1.5 rounded-[4px] text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee] font-medium text-[13px] transition-colors">
              <div className="flex items-center gap-3">
                <BarChart className="w-4 h-4 text-[#8792a2]" />
                Elaboración de infor...
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="flex items-center justify-between px-3 py-1.5 rounded-[4px] text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee] font-medium text-[13px] transition-colors">
              <div className="flex items-center gap-3">
                <MoreHorizontal className="w-4 h-4 text-[#8792a2]" />
                Más
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
          </nav>

          <div className="p-4 mt-auto">
            <a href="#" className="flex items-center justify-between px-2 py-1.5 text-[#425466] hover:text-[#1a1f36] font-medium text-[13px]">
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-[#8792a2]" />
                Desarrolladores
              </div>
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.02)] relative z-10 rounded-tl-xl md:rounded-tl-2xl">
          
          {/* Header Row */}
          <header className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-[4px] px-3 py-1.5 w-80 text-[13px] font-medium hover:border-[#c1c9d2] transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4]">
              <Search className="w-4 h-4 text-[#8792a2]" />
              <input type="text" placeholder="Buscar" className="bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] text-[#1a1f36]" />
            </div>

            <div className="flex items-center gap-4 text-[#4f566b]">
              <Grid className="w-[18px] h-[18px] cursor-pointer hover:text-[#1a1f36]" />
              <HelpCircle className="w-[18px] h-[18px] cursor-pointer hover:text-[#1a1f36]" />
              <Bell className="w-[18px] h-[18px] cursor-pointer hover:text-[#1a1f36]" />
              <Settings className="w-[18px] h-[18px] cursor-pointer hover:text-[#1a1f36]" />
              <div className="w-[28px] h-[28px] bg-[#5469d4] text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:opacity-90">
                <Plus className="w-4 h-4" />
              </div>
              
              <div className="ml-2 flex items-center gap-2 border border-[#e3e8ee] rounded-full pl-3 md:pr-1 pr-3 py-1 bg-white cursor-pointer hover:bg-[#f6f9fc] shadow-sm">
                <span className="text-[13px] font-semibold text-[#1a1f36]">Guía de configuración</span>
                <div className="w-[22px] h-[22px] rounded-full border-[3px] border-[#e3e8ee] border-t-[#5469d4] border-l-[#5469d4] transform rotate-45"></div>
              </div>
            </div>
          </header>

          <div className="px-8 max-w-6xl mx-auto pb-24">
            
            {/* HOY Section */}
            <div className="mt-4 mb-10">
              <h1 className="text-[28px] font-bold text-[#1a1f36] tracking-tight mb-8">Hoy</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                {/* Left Col */}
                <div className="flex flex-col border-b border-[#e3e8ee] pb-4 mb-4 md:border-b-0 md:pb-0 md:mb-0">
                  <div className="flex items-start gap-12">
                    <div>
                      <button className="flex items-center gap-1 text-[13px] hover:text-[#1a1f36] font-medium mb-1">
                        Ingresos (Mensual) <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-[20px] font-medium text-[#1a1f36]">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                      <div className="text-[12px] text-[#8792a2] mt-1">{new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div>
                      <button className="flex items-center gap-1 text-[13px] hover:text-[#1a1f36] font-medium mb-1">
                        Pacientes <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-[14px] text-[#4f566b] mt-1">{stats?.activePatients || 0} activos</div>
                    </div>
                  </div>
                  
                  {/* Faux straight line chart */}
                  <div className="mt-12 h-[2px] bg-[#e3e8ee] w-full relative flex items-end">
                    <div className="absolute left-0 bottom-0 h-[2px] w-1/3 bg-[#80e9ff]"></div>
                    <div className="absolute left-0 bottom-0 h-[2px] w-[20%] bg-[#7a32fc]"></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8792a2] mt-1 font-medium">
                    <span>0:00</span>
                    <span>23:59</span>
                  </div>
                </div>

                {/* Right Col */}
                <div className="flex flex-col gap-6">
                  {/* Row 1 */}
                  <div className="flex items-start justify-between border-b border-[#e3e8ee] pb-6">
                    <div>
                      <div className="text-[13px] font-medium mb-1">Citas (Esta semana)</div>
                      <div className="text-[20px] font-medium text-[#1a1f36]">{stats?.appointmentsThisWeek || 0}</div>
                    </div>
                    <a href="#" className="text-[13px] font-medium text-[#5469d4] hover:text-[#1a1f36] hover:underline mt-1">
                      Ver agenda
                    </a>
                  </div>
                  {/* Row 2 */}
                  <div className="flex items-start justify-between border-b border-[#e3e8ee] pb-6">
                    <div>
                      <div className="text-[13px] font-medium mb-1">Tasa de inasistencia (No-Show)</div>
                      <div className="text-[20px] font-medium text-[#1a1f36]">{stats?.noShowRate || 0}%</div>
                    </div>
                    <a href="#" className="text-[13px] font-medium text-[#5469d4] hover:text-[#1a1f36] hover:underline mt-1">
                      Ver IA Insights
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* TU RESUMEN Section */}
            <div className="mt-16">
              <h2 className="text-[20px] font-bold text-[#1a1f36] tracking-tight mb-4">Tu resumen</h2>
              
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#4f566b] mr-1">Intervalo de fechas</span>
                  <button className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent hover:bg-[#f6f9fc] rounded border border-transparent hover:border-[#e3e8ee] transition-colors">
                    Últimos 7 días <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent hover:bg-[#f6f9fc] rounded border border-transparent hover:border-[#e3e8ee] transition-colors">
                    Diario <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-[#e3e8ee] mx-1"></div>
                  <button className="flex items-center gap-1.5 px-2 py-1 text-[13px] font-medium text-[#4f566b] bg-transparent hover:bg-[#f6f9fc] rounded border border-transparent transition-colors">
                    <X className="w-3.5 h-3.5 text-[#8792a2]" />
                    Compara
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent hover:bg-[#f6f9fc] rounded border border-transparent hover:border-[#e3e8ee] transition-colors">
                    Período anterior <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[#1a1f36] bg-white border border-[#e3e8ee] rounded-[4px] hover:border-[#c1c9d2] transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5 text-[#5469d4]" /> Añadir
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[#1a1f36] bg-white border border-[#e3e8ee] rounded-[4px] hover:border-[#c1c9d2] transition-colors shadow-sm">
                    <Settings className="w-3.5 h-3.5 text-[#5469d4] opacity-80" /> Editar
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-[#f6f9fc] border border-[#e3e8ee] rounded-[8px] overflow-hidden">
                
                {/* Empty Chart Card */}
                <div className="bg-white p-5 border-r border-[#e3e8ee] flex flex-col h-[300px]">
                  <div className="flex items-center justify-between gap-1 mb-4">
                    <div className="flex items-center gap-1 text-[13px] font-medium text-[#1a1f36]">
                      Facturación <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                    </div>
                  </div>
                  <div className="flex-1 border border-dashed border-[#e3e8ee] rounded-[4px] flex items-center justify-center bg-[#fcfdff]">
                    <span className="text-[13px] text-[#4f566b] bg-[#f6f9fc] px-4 py-1.5 rounded-full border border-[#e3e8ee] shadow-sm">
                      No hay datos
                    </span>
                  </div>
                </div>

                {/* Gross Volume Card -> Citas Confirmadas */}
                <div className="bg-white p-5 border-r border-[#e3e8ee] flex flex-col relative h-[300px]">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                      <div className="flex items-center gap-1 text-[13px] font-medium text-[#1a1f36]">
                        Citas Confirmadas <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                      </div>
                      <div className="text-[20px] font-medium text-[#1a1f36] mt-1">{stats?.appointmentsThisWeek || 0}</div>
                      <div className="text-[13px] text-[#4f566b] mt-0.5">{stats?.appointmentsThisWeek || 0} período anterior</div>
                    </div>
                    <button className="p-1 border border-[#e3e8ee] rounded text-[#4f566b] bg-white hover:bg-[#f6f9fc] shadow-sm">
                      <BarChart className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Trend chart faux */}
                  <div className="absolute inset-x-5 bottom-8 h-24 flex items-end">
                    <div className="w-full relative h-px bg-[#e3e8ee] mb-4">
                      <div className="absolute top-0 right-0 h-full w-[40%] bg-[#7a32fc]"></div>
                    </div>
                    <div className="absolute top-0 w-full h-[60px] border-b border-[#e3e8ee] border-dashed pointer-events-none"></div>
                  </div>
                  
                  <div className="absolute left-5 right-5 bottom-5 flex justify-end text-[11px] text-[#8792a2] font-medium">
                    <span>{stats?.appointmentsThisWeek || 14}</span>
                  </div>
                </div>

                {/* Net Volume Card -> Pacientes Activos */}
                <div className="bg-white p-5 flex flex-col relative h-[300px]">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                      <div className="flex items-center gap-1 text-[13px] font-medium text-[#1a1f36]">
                        Pacientes Activos <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                      </div>
                      <div className="text-[20px] font-medium text-[#1a1f36] mt-1">{stats?.activePatients || 0}</div>
                      <div className="text-[13px] text-[#4f566b] mt-0.5">{stats?.activePatients ? stats.activePatients - 2 : 0} período anterior</div>
                    </div>
                  </div>
                  
                  {/* Trend chart faux */}
                  <div className="absolute inset-x-5 bottom-8 h-24 flex items-end">
                    <div className="w-full relative h-px bg-[#e3e8ee] mb-4">
                      <div className="absolute top-0 right-0 h-full w-[20%] bg-[#80e9ff]"></div>
                    </div>
                    <div className="absolute top-0 w-full h-[60px] border-b border-[#e3e8ee] border-dashed pointer-events-none"></div>
                  </div>
                  
                  <div className="absolute left-5 right-5 bottom-5 flex justify-end text-[11px] text-[#8792a2] font-medium">
                    <span>{stats?.activePatients || 4}</span>
                  </div>
                </div>

              </div>
              
            </div>

            {/* ACTIVIDAD RECIENTE Section */}
            <div className="mt-12">
              <h2 className="text-[16px] font-bold text-[#1a1f36] tracking-tight mb-4">Agenda del Día</h2>
              <div className="bg-white border border-[#e3e8ee] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e8ee] bg-[#f6f9fc]">
                        <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider w-[100px]">Hora</th>
                        <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider">Paciente</th>
                        <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider">Tratamiento</th>
                        <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e8ee]">
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-[#4f566b]">No hay citas el día de hoy</td>
                        </tr>
                      ) : (
                        appointments.map((apt) => (
                          <tr key={apt.id} className="hover:bg-[#f6f9fc] transition-colors">
                            <td className="px-4 py-3 text-[13px] font-medium text-[#1a1f36]">{apt.startTime}</td>
                            <td className="px-4 py-3 text-[13px] text-[#4f566b]">{apt.patientName}</td>
                            <td className="px-4 py-3 text-[13px] text-[#4f566b]">{apt.type}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium ${
                                apt.status === 'CONFIRMED' ? 'bg-[#e3f2fd] text-[#0d47a1]' : 
                                apt.status === 'IN-PROGRESS' ? 'bg-[#e8f5e9] text-[#1b5e20]' : 
                                'bg-[#fff3e0] text-[#e65100]'
                              }`}>
                                {apt.status === 'CONFIRMED' ? 'Confirmada' : apt.status === 'IN-PROGRESS' ? 'En sala' : 'Pendiente'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
