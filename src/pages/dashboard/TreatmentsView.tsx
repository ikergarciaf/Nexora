import React, { useState } from 'react';
import { Search, Plus, Package, MoreHorizontal, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react';
import { DashboardViewProps } from './types';

const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

export default function TreatmentsView({ isDarkMode }: DashboardViewProps) {
  const [localServices, setLocalServices] = useState([
    { id: 'serv-1', name: 'Primera Visita / Evaluación', description: 'Diagnóstico general y elaboración de presupuesto', category: 'Diagnóstico', duration: 30, price: 0 },
    { id: 'serv-2', name: 'Higiene Dental Completa', description: '', category: 'Prevención', duration: 45, price: 60 },
    { id: 'serv-3', name: 'Blanqueamiento Láser', description: '', category: 'Estética', duration: 60, price: 250 },
  ]);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [newServiceForm, setNewServiceForm] = useState({ name: '', description: '', category: '', duration: 30, price: 0 });
  const [isSubmittingService, setIsSubmittingService] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.name) return;
    setLocalServices(prev => [...prev, { ...newServiceForm, id: `serv-${Date.now()}` }]);
    setIsAddServiceModalOpen(false);
    setNewServiceForm({ name: '', description: '', category: '', duration: 30, price: 0 });
  };

  const handleEditServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name) return;
    setLocalServices(prev => prev.map(s => s.id === editingService.id ? editingService : s));
    setIsEditServiceModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este servicio? Esta acción no se puede deshacer.')) {
      setLocalServices(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12  pb-24 mt-8 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-[24px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Servicios / Tratamientos</h1>
        <button
          onClick={() => setIsAddServiceModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" /> Añadir Servicio
        </button>
      </div>

      <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          <Search className="w-4 h-4 text-[#8792a2]" />
          <input
            type="text"
            placeholder="Buscar por nombre de servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}
          />
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Servicio</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Categoría</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Duración</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Precio</th>
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
              {localServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-8 h-8 text-[#8792a2] mb-3" />
                      <h3 className={`text-[14px] font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No hay servicios todavía</h3>
                      <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Empieza añadiendo tu primer servicio / tratamiento.</p>
                      <button
                        onClick={() => setIsAddServiceModalOpen(true)}
                        className="text-[#5469d4] font-semibold text-[13px] hover:underline"
                      >
                        Añadir servicio
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                localServices.map((service) => (
                  <tr key={service.id} className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{service.name}</span>
                      {service.description && <div className={`text-[12px] mt-0.5 truncate max-w-[250px] transition-colors ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>{service.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-[#e3e8ee] text-[#4f566b]'}`}>{service.category || 'General'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[13px] transition-colors ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{service.duration} min</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[13px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{service.price === 0 ? 'Gratis' : formatCurrency(service.price)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative action-menu-container flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === service.id ? null : service.id); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeDropdown === service.id && (
                          <div className={`absolute right-8 top-0 w-32 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setEditingService(service); setIsEditServiceModalOpen(true); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeleteService(service.id); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </button>
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
          <span>Mostrando {localServices.length} resultados</span>
        </div>
      </div>

      {isEditServiceModalOpen && editingService && (
        <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1a1f36]">Editar servicio / tratamiento</h3>
              <button onClick={() => setIsEditServiceModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditServiceSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Nombre del servicio *</label>
                  <input
                    type="text"
                    required
                    value={editingService.name}
                    onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Descripción</label>
                  <input
                    type="text"
                    value={editingService.description}
                    onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Categoría</label>
                  <input
                    type="text"
                    value={editingService.category}
                    onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Duración (minutos)</label>
                    <input
                      type="number"
                      required
                      value={editingService.duration}
                      onChange={(e) => setEditingService({...editingService, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Precio (€)</label>
                    <input
                      type="number"
                      required
                      value={editingService.price}
                      onChange={(e) => setEditingService({...editingService, price: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditServiceModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddServiceModalOpen && (
        <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1a1f36]">Añadir nuevo servicio</h3>
              <button onClick={() => setIsAddServiceModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddServiceSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Nombre del servicio *</label>
                  <input
                    type="text"
                    required
                    value={newServiceForm.name}
                    onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Descripción</label>
                  <input
                    type="text"
                    value={newServiceForm.description}
                    onChange={(e) => setNewServiceForm({...newServiceForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Categoría</label>
                  <input
                    type="text"
                    value={newServiceForm.category}
                    onChange={(e) => setNewServiceForm({...newServiceForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Duración (minutos)</label>
                    <input
                      type="number"
                      required
                      value={newServiceForm.duration}
                      onChange={(e) => setNewServiceForm({...newServiceForm, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Precio (€)</label>
                    <input
                      type="number"
                      required
                      value={newServiceForm.price}
                      onChange={(e) => setNewServiceForm({...newServiceForm, price: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
                >
                  Guardar servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
