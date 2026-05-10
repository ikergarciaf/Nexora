import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Search, MoreHorizontal, Trash2, X, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardViewProps } from './types';

interface InvoiceItem {
  id: string;
  number: string;
  date: string;
  client: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

function apiHeaders() {
  const token = localStorage.getItem('clinic_token');
  return {
    'Content-Type': 'application/json',
    'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
    'Authorization': `Bearer ${token}`,
  };
}

export default function BillingView({ isDarkMode }: DashboardViewProps) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [stats, setStats] = useState({ monthlyRevenue: 0, pendingCount: 0, paidCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInvoices = async () => {
    try {
      const [invRes, statsRes] = await Promise.all([
        fetch('/api/invoices', { headers: apiHeaders() }),
        fetch('/api/invoices/stats', { headers: apiHeaders() }),
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleDownloadInvoicePDF = (inv: InvoiceItem) => {
    const clinicName = localStorage.getItem('clinic-name') || 'Tu Clínica';
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('FACTURA', 14, 22);
    doc.setFontSize(14);
    doc.text(clinicName, 14, 32);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha: ${inv.date}`, 14, 42);
    doc.text(`Nº Factura: ${inv.number}`, 14, 48);
    doc.text(`Cliente: ${inv.client}`, 14, 54);
    autoTable(doc, {
      startY: 65,
      head: [['Descripción', 'Cantidad', 'Precio', 'Total']],
      body: [[inv.description || 'Servicio', '1', formatCurrency(inv.amount), formatCurrency(inv.amount)]],
      theme: 'grid',
      headStyles: { fillColor: [84, 105, 212] },
    });
    const finalY = (doc as any).lastAutoTable.finalY || 65;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total a pagar: ${formatCurrency(inv.amount)}`, 14, finalY + 15);
    doc.save(`factura_${inv.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/invoices/${id}/status`, {
      method: 'PUT',
      headers: apiHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchInvoices();
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#5469d4]" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-24 mt-8 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-[24px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Facturación</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = `/api/invoices`;
              a.download = 'invoices.json';
              a.click();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[4px] font-bold text-[13px] transition-colors shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:bg-[#f6f9fc]'}`}
          >
            <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`} /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Ingresos (Mes)</div>
          <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(stats.monthlyRevenue)}</div>
        </div>
        <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Pagadas</div>
          <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats.paidCount}</div>
        </div>
        <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
          <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Pendientes</div>
          <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats.pendingCount}</div>
        </div>
      </div>

      <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          <Search className="w-4 h-4 text-[#8792a2]" />
          <input
            type="text"
            placeholder="Buscar por cliente, nº factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}
          />
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Fecha / Factura</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Cliente</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Importe</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <h3 className={`text-[14px] font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No hay facturas todavía</h3>
                      <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Las facturas aparecerán aquí cuando generes cobros.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{inv.date}</span>
                      <div className={`text-[12px] mt-0.5 uppercase tracking-wide font-mono transition-colors ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>{inv.number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{inv.client}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[13px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(inv.amount)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${
                        inv.status === 'PAID'
                          ? (isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-[#e8f5e9] text-[#1b5e20]')
                          : inv.status === 'CANCELLED'
                          ? (isDarkMode ? 'bg-red-900/40 text-red-400' : 'bg-[#ffebee] text-[#c62828]')
                          : (isDarkMode ? 'bg-orange-900/40 text-orange-400' : 'bg-[#fff3e0] text-[#e65100]')
                      }`}>
                        {inv.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : null}
                        {inv.status === 'PAID' ? 'Pagado' : inv.status === 'CANCELLED' ? 'Anulada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <div className="relative action-menu-container flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === inv.id ? null : inv.id); }}
                          className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeDropdown === inv.id && (
                          <div className={`absolute right-8 top-0 w-44 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDownloadInvoicePDF(inv); }}
                              className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}
                            >
                              <Download className="w-3.5 h-3.5" /> Descargar PDF
                            </button>
                            {inv.status === 'PENDING' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleStatusChange(inv.id, 'PAID'); }}
                                className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-green-400 hover:bg-[#334155]' : 'text-[#1b5e20] hover:bg-[#f6f9fc]'}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Marcar Pagada
                              </button>
                            )}
                            {inv.status !== 'CANCELLED' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleStatusChange(inv.id, 'CANCELLED'); }}
                                className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Anular factura
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`px-4 py-3 border-t transition-colors text-[12px] ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-gray-500' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#4f566b]'}`}>
          <span>Mostrando {filteredInvoices.length} facturas</span>
        </div>
      </div>
    </div>
  );
}
