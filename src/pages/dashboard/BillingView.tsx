import React, { useState } from 'react';
import { Download, Plus, CheckCircle2, Search, MoreHorizontal, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardViewProps } from './types';
import { useDashboardData } from '../../hooks/useDashboardData';

export default function BillingView({ isDarkMode }: DashboardViewProps) {
  const { stats } = useDashboardData();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  const handleDownloadInvoicePDF = (invoiceInfo: any) => {
    const clinicName = localStorage.getItem('clinic-name') || 'Tu Clínica';
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('FACTURA', 14, 22);
    
    doc.setFontSize(14);
    doc.text(clinicName, 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha: ${invoiceInfo.date}`, 14, 42);
    doc.text(`Nº Factura: ${invoiceInfo.number}`, 14, 48);
    doc.text(`Cliente: ${invoiceInfo.client}`, 14, 54);
    
    autoTable(doc, {
      startY: 65,
      head: [['Descripción', 'Cantidad', 'Precio', 'Total']],
      body: [
        ['Tratamiento General', '1', invoiceInfo.amount, invoiceInfo.amount],
      ],
      theme: 'grid',
      headStyles: { fillColor: [84, 105, 212] }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 65;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total a pagar: ${invoiceInfo.amount}`, 14, finalY + 15);
    
    doc.save(`factura_${invoiceInfo.number}.pdf`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1440px] mx-auto pb-24 mt-8 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-[24px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Facturación</h1>
        <div className="flex gap-2">
          <button 
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[4px] font-bold text-[13px] transition-colors shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:bg-[#f6f9fc]'}`}
          >
            <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`} /> Exportar
          </button>
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nueva Factura
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Ingresos brutos (Mes)</div>
          <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(stats?.monthlyRevenue || 0)}</div>
        </div>
        <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Pagos completados</div>
          <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>24</div>
        </div>
        <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Pagos pendientes</div>
          <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>2</div>
        </div>
      </div>

      <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          <Search className="w-4 h-4 text-[#8792a2]" />
          <input type="text" placeholder="Buscar por cliente, nº factura o importe..." className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Fecha / Factura</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Cliente</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Importe</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Estado</th>
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
              <tr className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>22 Abr 2026</span>
                  <div className={`text-[12px] mt-0.5 uppercase tracking-wide font-mono transition-colors ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>#FV-2026-031</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-[#1b5e20]/10 text-[#1b5e20]'}`}>MR</div>
                    <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>María Rodríguez</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[13px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(60)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-[#e8f5e9] text-[#1b5e20]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Pagado
                  </span>
                </td>
                <td className="px-4 py-3 text-right relative">
                  <div className="relative action-menu-container flex justify-end">
                    <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `inv-1` ? null : `inv-1`); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {activeDropdown === `inv-1` && (
                      <div className={`absolute right-8 top-0 w-40 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDownloadInvoicePDF({ date: '22 Abr 2026', number: 'FV-2026-031', client: 'María Rodríguez', amount: formatCurrency(60) }); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                          <Download className="w-3.5 h-3.5" /> Descargar PDF
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
                          <Trash2 className="w-3.5 h-3.5" /> Anular factura
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>

              <tr className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>21 Abr 2026</span>
                  <div className={`text-[12px] mt-0.5 uppercase tracking-wide font-mono transition-colors ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>#FV-2026-030</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-[#0d47a1]/10 text-[#0d47a1]'}`}>JG</div>
                    <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Juán Gómez</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[13px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(250)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${isDarkMode ? 'bg-orange-900/40 text-orange-400' : 'bg-[#fff3e0] text-[#e65100]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-orange-400' : 'bg-[#e65100]'}`}></span> Pendiente
                  </span>
                </td>
                <td className="px-4 py-3 text-right relative">
                  <div className="relative action-menu-container flex justify-end">
                    <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `inv-2` ? null : `inv-2`); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {activeDropdown === `inv-2` && (
                      <div className={`absolute right-8 top-0 w-40 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                         <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-green-400 hover:bg-[#334155]' : 'text-[#1b5e20] hover:bg-[#f6f9fc]'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Marcar Pagada
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDownloadInvoicePDF({ date: '21 Abr 2026', number: 'FV-2026-030', client: 'Juán Gómez', amount: formatCurrency(250) }); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                          <Download className="w-3.5 h-3.5" /> Descargar PDF
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
                          <Trash2 className="w-3.5 h-3.5" /> Anular factura
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className={`px-4 py-3 border-t transition-colors text-[12px] ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-gray-500' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#4f566b]'}`}>
          <span>Mostrando 2 facturas recientes</span>
        </div>
      </div>
    </div>
  );
}
