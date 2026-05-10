import React, { useState } from 'react';
import { Plus, Trash2, Package, Search, AlertCircle, Syringe } from 'lucide-react';

interface Vial {
  id: string;
  name: string;
  brand: string;
  lotFile: string;
  expiryDate: string;
  quantity: number;
  lowStockThreshold: number;
}

interface VialStockProps {
  isDarkMode: boolean;
  value?: Vial[];
  onChange?: (value: Vial[]) => void;
}

export const VialStock: React.FC<VialStockProps> = ({ isDarkMode, value = [], onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVial, setNewVial] = useState<Partial<Vial>>({
    name: '', brand: '', lotFile: '', expiryDate: '', quantity: 1, lowStockThreshold: 5
  });

  const generateLot = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const addVial = () => {
    if (!newVial.name || !newVial.brand) return;
    const v: Vial = {
      id: Math.random().toString(36).substring(7),
      name: newVial.name,
      brand: newVial.brand,
      lotFile: newVial.lotFile || generateLot(),
      expiryDate: newVial.expiryDate || new Date(Date.now() + 31536000000).toISOString().split('T')[0],
      quantity: Number(newVial.quantity) || 1,
      lowStockThreshold: Number(newVial.lowStockThreshold) || 5
    };
    onChange?.([...value, v]);
    setShowAddForm(false);
    setNewVial({ name: '', brand: '', lotFile: '', expiryDate: '', quantity: 1, lowStockThreshold: 5 });
  };

  const updateQuantity = (id: string, delta: number) => {
    const newStock = value.map(v => {
      if (v.id === id) {
        const nq = Math.max(0, v.quantity + delta);
        return { ...v, quantity: nq };
      }
      return v;
    });
    onChange?.(newStock);
  };

  const removeVial = (id: string) => {
    onChange?.(value.filter(v => v.id !== id));
  };

  const filteredStock = value.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.lotFile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col gap-6 p-8 min-h-[600px] ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
           <h2 className={`text-[20px] font-black border-b-2 border-pink-500 pb-1 inline-block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Control de Viales</h2>
           <p className="text-[12px] text-gray-500 font-medium mt-2">Gestión de stock e inventario de productos médicos estéticos.</p>
        </div>
        <div className="flex gap-4 items-center">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar lote, producto..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`pl-9 pr-4 py-2.5 border rounded-xl text-[12px] font-bold outline-none focus:border-pink-500 w-64 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-800' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
              />
           </div>
           <button 
             onClick={() => setShowAddForm(!showAddForm)}
             className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-[12px] font-bold shadow-md transition-colors"
           >
             <Plus className="w-4 h-4" /> Registrar Producto
           </button>
        </div>
      </div>

      {showAddForm && (
        <div className={`p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4 ${isDarkMode ? 'bg-pink-900/10 border-pink-800/30' : 'bg-pink-50/50 border-pink-100'}`}>
          <div className="grid grid-cols-6 gap-4 items-end">
            <div className="col-span-2">
              <label className={`text-[10px] font-bold uppercase block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Producto / Activo</label>
              <input type="text" placeholder="Ej. Ácido Hialurónico" value={newVial.name} onChange={e => setNewVial({...newVial, name: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div className="col-span-1">
              <label className={`text-[10px] font-bold uppercase block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Marca</label>
              <input type="text" placeholder="Ej. Juvederm" value={newVial.brand} onChange={e => setNewVial({...newVial, brand: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div className="col-span-1">
              <label className={`text-[10px] font-bold uppercase block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lote</label>
              <input type="text" placeholder="Autogenerado si vacío" value={newVial.lotFile} onChange={e => setNewVial({...newVial, lotFile: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div className="col-span-1">
              <label className={`text-[10px] font-bold uppercase block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Caducidad</label>
              <input type="date" value={newVial.expiryDate} onChange={e => setNewVial({...newVial, expiryDate: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div className="col-span-1">
              <label className={`text-[10px] font-bold uppercase block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cantidad Inicial</label>
              <input type="number" min="0" value={newVial.quantity} onChange={e => setNewVial({...newVial, quantity: parseInt(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg text-[12px] font-bold outline-none focus:border-pink-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`} />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-3">
             <button onClick={() => setShowAddForm(false)} className="px-5 py-2 text-[12px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
             <button onClick={addVial} disabled={!newVial.name || !newVial.brand} className="px-5 py-2 text-[12px] font-bold text-white bg-slate-900 rounded-lg shadow-sm disabled:opacity-50">Guardar Lote</button>
          </div>
        </div>
      )}

      <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className={`border-b text-[10px] font-bold uppercase tracking-widest leading-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                  <th className="py-4 px-6 font-bold">Producto</th>
                  <th className="py-4 px-6 font-bold">Marca</th>
                  <th className="py-4 px-6 font-bold">Lote</th>
                  <th className="py-4 px-6 font-bold">Caducidad</th>
                  <th className="py-4 px-6 font-bold text-center">Stock</th>
                  <th className="py-4 px-6 font-bold text-right">Acciones</th>
               </tr>
            </thead>
            <tbody className={`divide-y text-[13px] ${isDarkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
               {filteredStock.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="py-12 text-center text-gray-400 opacity-60">
                      <Package className="w-8 h-8 mx-auto mb-2" strokeWidth={1.5} />
                      <p className="font-medium text-[11px]">Inventario vacío</p>
                   </td>
                 </tr>
               ) : (
                 filteredStock.map(v => {
                   const isLow = v.quantity <= v.lowStockThreshold;
                   const isExpired = new Date(v.expiryDate) < new Date();
                   return (
                      <tr key={v.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50/50'}`}>
                         <td className={`py-3 px-6 font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLow ? 'bg-red-50 text-red-500' : 'bg-pink-50 text-pink-600'}`}>
                              <Syringe className="w-4 h-4" />
                           </div>
                           {v.name}
                        </td>
                         <td className={`py-3 px-6 font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{v.brand}</td>
                        <td className="py-3 px-6">
                            <span className={`font-mono text-[11px] font-bold px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{v.lotFile}</span>
                        </td>
                        <td className="py-3 px-6">
                           <span className={`font-bold ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>{v.expiryDate}</span>
                           {isExpired && <AlertCircle className="w-3 h-3 inline-block ml-1 text-red-500" aria-label="Caducado" />}
                        </td>
                        <td className="py-3 px-6 text-center">
                           <div className="flex items-center justify-center gap-2">
                              <button onClick={() => updateQuantity(v.id, -1)} className={`w-6 h-6 flex items-center justify-center rounded-md border font-bold ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-900'}`}>-</button>
                              <span className={`w-8 font-black ${isLow ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>{v.quantity}</span>
                              <button onClick={() => updateQuantity(v.id, 1)} className={`w-6 h-6 flex items-center justify-center rounded-md border font-bold ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-900'}`}>+</button>
                           </div>
                        </td>
                        <td className="py-3 px-6 text-right">
                           <button onClick={() => removeVial(v.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar registro">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                   )
                 })
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};
