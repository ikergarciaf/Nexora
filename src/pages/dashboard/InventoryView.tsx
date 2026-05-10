import { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, Search, Loader2, Trash2, Edit3, X } from 'lucide-react';
import { DashboardViewProps } from './types';
import { apiHeaders } from '../../services/api';

interface InventoryItem {
  id: string; name: string; description?: string; category: string; quantity: number; minStock: number; price: number; supplier?: string; batch?: string; expiresAt?: string;
}

export default function InventoryView({ isDarkMode }: DashboardViewProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', category: 'General', quantity: 0, minStock: 5, price: 0, supplier: '', batch: '', expiresAt: '' });

  const loadItems = async () => {
    setLoading(true);
    const res = await window.fetch('/api/inventory', { headers: apiHeaders() });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const handleSave = async () => {
    if (!form.name) return;
    const url = editing ? `/api/inventory/${editing.id}` : '/api/inventory';
    const method = editing ? 'PUT' : 'POST';
    await window.fetch(url, { method, headers: apiHeaders(), body: JSON.stringify(form) });
    setShowForm(false); setEditing(null); setForm({ name: '', description: '', category: 'General', quantity: 0, minStock: 5, price: 0, supplier: '', batch: '', expiresAt: '' });
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este item?')) return;
    await window.fetch(`/api/inventory/${id}`, { method: 'DELETE', headers: apiHeaders() });
    loadItems();
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i => i.quantity <= i.minStock);

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#008477]" /></div>;

  return (
    <div className="px-4 md:px-8 xl:px-12 max-w-6xl mx-auto pb-24 mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Inventario</h1>
          <p className={`text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{items.length} productos · {lowStock.length} con stock bajo</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', category: 'General', quantity: 0, minStock: 5, price: 0, supplier: '', batch: '', expiresAt: '' }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#008477] text-white rounded-lg font-semibold hover:bg-[#006b5f]">
          <Plus className="w-4 h-4" /> Añadir producto
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">{lowStock.length} producto(s) con stock bajo</p>
            <p className="text-amber-700 text-xs mt-1">{lowStock.map(i => i.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className={`mb-6 flex items-center gap-3 px-4 py-3 border rounded-lg ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        <Search className="w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o categoría..." className="bg-transparent border-none outline-none w-full text-sm" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className={`w-full max-w-lg rounded-2xl p-6 ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{editing ? 'Editar' : 'Nuevo'} producto</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="col-span-2 p-3 border rounded-lg text-sm" />
              <input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="col-span-2 p-3 border rounded-lg text-sm" />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="p-3 border rounded-lg text-sm">
                <option value="General">General</option>
                <option value="Medicamentos">Medicamentos</option>
                <option value="Material">Material</option>
                <option value="Equipamiento">Equipamiento</option>
              </select>
              <input value={form.supplier || ''} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Proveedor" className="p-3 border rounded-lg text-sm" />
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} placeholder="Cantidad" className="p-3 border rounded-lg text-sm" />
              <input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: parseInt(e.target.value) || 5 })} placeholder="Stock mínimo" className="p-3 border rounded-lg text-sm" />
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} placeholder="Precio" className="p-3 border rounded-lg text-sm" />
              <input value={form.batch || ''} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="Lote" className="p-3 border rounded-lg text-sm" />
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="p-3 border rounded-lg text-sm" />
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 bg-[#008477] text-white rounded-lg font-semibold hover:bg-[#006b5f]">{editing ? 'Guardar cambios' : 'Crear producto'}</button>
          </div>
        </div>
      )}

      <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        <table className="w-full text-left">
          <thead><tr className={`border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Producto</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Categoría</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Stock</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Precio</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
            {filtered.map(item => (
              <tr key={item.id} className={`${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-gray-50'}`}>
                <td className="px-4 py-3">
                  <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</span>
                  {item.batch && <span className="ml-2 text-xs text-gray-400">Lote: {item.batch}</span>}
                </td>
                <td className="px-4 py-3"><span className="text-xs text-gray-400">{item.category}</span></td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-bold ${item.quantity <= item.minStock ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.quantity}</span>
                  {item.quantity <= item.minStock && <AlertTriangle className="w-3 h-3 inline ml-1 text-red-500" />}
                </td>
                <td className="px-4 py-3 text-right text-sm">{item.price.toFixed(2)}€</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(item); setForm({ ...item, expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : '' }); setShowForm(true); }} className="p-1 text-gray-400 hover:text-[#008477]"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-400">No hay productos en inventario</div>}
      </div>
    </div>
  );
}
