import React, { useState } from 'react';
import { Plus, Trash2, FileText, CheckCircle2, ChevronDown, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quote {
  id: string;
  date: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  items: QuoteItem[];
}

interface QuotesManagerProps {
  isDarkMode: boolean;
  value?: Quote[];
  onChange?: (value: Quote[]) => void;
}

export const QuotesManager: React.FC<QuotesManagerProps> = ({ isDarkMode, value = [], onChange }) => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const createQuote = () => {
    const newQuote: Quote = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      items: [{ id: Math.random().toString(36).substring(7), description: 'Tratamiento inicial', quantity: 1, unitPrice: 0 }]
    };
    onChange?.([...value, newQuote]);
    setSelectedQuoteId(newQuote.id);
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    const newQuotes = value.map(q => q.id === id ? { ...q, ...updates } : q);
    onChange?.(newQuotes);
  };

  const deleteQuote = (id: string) => {
    const newQuotes = value.filter(q => q.id !== id);
    if (selectedQuoteId === id) setSelectedQuoteId(null);
    onChange?.(newQuotes);
  };

  const updateItem = (quoteId: string, itemId: string, updates: Partial<QuoteItem>) => {
    const quote = value.find(q => q.id === quoteId);
    if (!quote) return;
    const newItems = quote.items.map(item => item.id === itemId ? { ...item, ...updates } : item);
    updateQuote(quoteId, { items: newItems });
  };

  const addItem = (quoteId: string) => {
    const quote = value.find(q => q.id === quoteId);
    if (!quote) return;
    const newItem: QuoteItem = { id: Math.random().toString(36).substring(7), description: '', quantity: 1, unitPrice: 0 };
    updateQuote(quoteId, { items: [...quote.items, newItem] });
  };

  const removeItem = (quoteId: string, itemId: string) => {
    const quote = value.find(q => q.id === quoteId);
    if (!quote) return;
    const newItems = quote.items.filter(item => item.id !== itemId);
    updateQuote(quoteId, { items: newItems });
  };

  const downloadPDF = (quote: Quote) => {
    const doc = new jsPDF();
    const total = quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    
    doc.setFontSize(20);
    doc.text('Presupuesto Dental', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Fecha: ${quote.date}`, 14, 30);
    doc.text(`ID Presupuesto: ${quote.id.toUpperCase()}`, 14, 35);
    doc.text(`Estado: ${quote.status.toUpperCase()}`, 14, 40);

    const tableColumn = ["Descripción", "Cantidad", "Precio Unit.", "Total"];
    const tableRows = quote.items.map(item => [
      item.description,
      item.quantity.toString(),
      `${item.unitPrice.toFixed(2)}€`,
      `${(item.quantity * item.unitPrice).toFixed(2)}€`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [15, 23, 42] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${total.toFixed(2)}€`, 14, finalY + 10);

    doc.save(`Presupuesto_${quote.id}.pdf`);
  };

  const selectedQuote = value.find(q => q.id === selectedQuoteId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-0 min-h-[600px] bg-white">
      {/* Sidebar List */}
      <div className="flex-[1] flex flex-col border-r border-gray-100 p-6 bg-gray-50/30">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Presupuestos</h3>
            <button 
              onClick={createQuote}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold shadow-sm transition-transform hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </button>
         </div>

         <div className="space-y-3 overflow-y-auto">
            {value.length === 0 ? (
              <div className="text-center py-12 text-gray-400 opacity-60">
                 <FileText className="w-8 h-8 mx-auto mb-3" strokeWidth={1.5} />
                 <p className="text-[11px] font-medium">No hay presupuestos</p>
              </div>
            ) : (
              value.map(quote => (
                <button
                  key={quote.id}
                  onClick={() => setSelectedQuoteId(quote.id)}
                  className={`w-full p-4 rounded-2xl flex flex-col gap-2 transition-all border ${selectedQuoteId === quote.id ? 'bg-white border-slate-900 shadow-sm' : 'bg-white border-gray-100 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black tracking-wider text-slate-800">#{quote.id.toUpperCase()}</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md ${
                      quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[11px] font-bold text-gray-500">
                    <span>{quote.date}</span>
                    <span className="text-slate-900">{quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}€</span>
                  </div>
                </button>
              ))
            )}
         </div>
      </div>

      {/* Editor Main Area */}
      <div className="flex-[2] flex flex-col p-6">
        {selectedQuote ? (
          <div className="space-y-6">
             <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                   <h2 className="text-[18px] font-black text-slate-900">Editar Presupuesto</h2>
                   <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Ref: {selectedQuote.id.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                   <select 
                     value={selectedQuote.status}
                     onChange={(e) => updateQuote(selectedQuote.id, { status: e.target.value as Quote['status'] })}
                     className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold outline-none focus:border-slate-900 transition-colors"
                   >
                     <option value="draft">Borrador</option>
                     <option value="sent">Enviado</option>
                     <option value="accepted">Aceptado</option>
                     <option value="rejected">Rechazado</option>
                   </select>

                   <button 
                     onClick={() => downloadPDF(selectedQuote)}
                     className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors"
                     title="Descargar PDF"
                   >
                     <Download className="w-4 h-4" />
                   </button>
                   
                   <button 
                     onClick={() => deleteQuote(selectedQuote.id)}
                     className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 border border-red-100 transition-colors"
                     title="Eliminar Presupuesto"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <div className="space-y-3">
               <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="col-span-6">Descripción</div>
                  <div className="col-span-2">Cantidad</div>
                  <div className="col-span-2">Precio U.</div>
                  <div className="col-span-2">Total</div>
               </div>
               
               {selectedQuote.items.map((item, index) => (
                 <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <div className="col-span-6">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateItem(selectedQuote.id, item.id, { description: e.target.value })}
                        placeholder="Ej. Limpieza Dental"
                        className="w-full bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-[12px] font-bold outline-none focus:border-slate-900 transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(selectedQuote.id, item.id, { quantity: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-[12px] font-bold outline-none focus:border-slate-900 transition-colors"
                      />
                    </div>
                    <div className="col-span-2 relative">
                      <input 
                        type="number" 
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(selectedQuote.id, item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white pl-4 pr-8 py-2.5 rounded-xl border border-gray-200 text-[12px] font-bold outline-none focus:border-slate-900 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">€</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-between px-2">
                      <span className="text-[12px] font-black text-slate-900">{(item.quantity * item.unitPrice).toFixed(2)}€</span>
                      <button 
                        onClick={() => removeItem(selectedQuote.id, item.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                 </div>
               ))}
             </div>

             <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button 
                  onClick={() => addItem(selectedQuote.id)}
                  className="flex items-center gap-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir Concepto
                </button>
                <div className="text-right bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-md">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-0.5">Total Presupuestado</p>
                   <p className="text-[20px] font-black">
                     {selectedQuote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}€
                   </p>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <FileText className="w-12 h-12 text-gray-400 mb-4" strokeWidth={1} />
             <h4 className="text-[14px] font-bold mb-1 text-gray-500 uppercase tracking-wider">Ningún presupuesto</h4>
             <p className="text-[12px] text-gray-400 max-w-[200px]">Selecciona o crea un nuevo presupuesto.</p>
          </div>
        )}
      </div>
    </div>
  );
};
