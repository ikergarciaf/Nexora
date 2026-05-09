import React, { useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { useDashboardData, createPatientApi, updatePatientApi, deletePatientApi } from '../../hooks/useDashboardData';
import type { DashboardViewProps } from './types';

export default function PatientsView({ isDarkMode, onNavigate }: DashboardViewProps) {
  const { patients, refreshData } = useDashboardData();

  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ fullName: '', email: '', phone: '' });
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter((p: any) =>
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.fullName) return;
    setIsSubmittingPatient(true);
    await createPatientApi(newPatientForm);
    await refreshData();
    setNewPatientForm({ fullName: '', email: '', phone: '' });
    setIsAddPatientModalOpen(false);
    setIsSubmittingPatient(false);
  };

  const handleEditPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient || !editingPatient.fullName) return;
    setIsSubmittingPatient(true);
    await updatePatientApi(editingPatient.id, {
      fullName: editingPatient.fullName,
      email: editingPatient.email,
      phone: editingPatient.phone
    });
    await refreshData();
    setIsEditPatientModalOpen(false);
    setIsSubmittingPatient(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
      await deletePatientApi(id);
      await refreshData();
    }
  };

  const handlePatientClick = (patientId: string) => {
    localStorage.setItem('selected_patient_id', patientId);
    onNavigate('historial_clinico');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12  pb-24 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Clientes / Pacientes</h1>
        <button 
          onClick={() => setIsAddPatientModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>

      <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          <Search className="w-4 h-4 text-[#8792a2]" />
          <input
            type="text"
            placeholder="Filtrar clientes por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}
          />
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Nombre Completo</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Contacto</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Etiquetas</th>
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-8 h-8 text-[#8792a2] mb-3" />
                      <h3 className={`text-[14px] font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No hay clientes todavía</h3>
                      <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Empieza añadiendo tu primer paciente.</p>
                      <button 
                        onClick={() => setIsAddPatientModalOpen(true)}
                        className="text-[#5469d4] font-semibold text-[13px] hover:underline dark:text-[#a5b4fc]"
                      >
                        Añadir cliente
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient: any) => (
                  <tr 
                    key={patient.id} 
                    onClick={() => handlePatientClick(patient.id)}
                    className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${isDarkMode ? 'bg-[#0f172a] text-gray-300' : 'bg-[#e3e8ee] text-[#1a1f36]'}`}>
                          {patient.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <span className={`text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{patient.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex flex-col text-[12px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                        {patient.email && (
                          <a href={`mailto:${patient.email}`} className="flex items-center gap-1.5 hover:text-[#008477] transition-all cursor-pointer">
                            <Mail className="w-3 h-3" /> {patient.email}
                          </a>
                        )}
                        {patient.phone ? <span className="flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" /> {patient.phone}</span> : null}
                        {!patient.email && !patient.phone && <span className="text-[#8792a2]">Sin contacto</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {patient.tags && patient.tags !== '[]' ? (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#e3e8ee] text-[#4f566b]'}`}>
                          NUEVO
                        </span>
                      ) : <span className="text-[12px] text-[#8792a2]">-</span>}
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <div className="relative action-menu-container flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `patient-${patient.id}` ? null : `patient-${patient.id}`); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeDropdown === `patient-${patient.id}` && (
                          <div className={`absolute right-8 top-0 w-32 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setEditingPatient(patient); setIsEditPatientModalOpen(true); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeletePatient(patient.id); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
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
          <span>Mostrando {filteredPatients.length} resultados</span>
        </div>
      </div>

      {/* Edit Patient Modal */}
      {isEditPatientModalOpen && editingPatient && (
        <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1a1f36]">Editar cliente</h3>
              <button onClick={() => { setIsEditPatientModalOpen(false); setEditingPatient(null); }} className="text-[#8792a2] hover:text-[#1a1f36]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditPatientSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Nombre completo *</label>
                  <input 
                    type="text" 
                    required
                    value={editingPatient.fullName}
                    onChange={(e) => setEditingPatient({...editingPatient, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Correo electrónico</label>
                  <input 
                    type="email" 
                    value={editingPatient.email}
                    onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Teléfono</label>
                  <input 
                    type="tel" 
                    value={editingPatient.phone || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsEditPatientModalOpen(false); setEditingPatient(null); }}
                  className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingPatient}
                  className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                  {isSubmittingPatient ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1a1f36]">Añadir cliente / paciente</h3>
              <button onClick={() => setIsAddPatientModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPatientSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Nombre completo *</label>
                  <input 
                    type="text" 
                    required
                    value={newPatientForm.fullName}
                    onChange={(e) => setNewPatientForm({...newPatientForm, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    placeholder="Ej. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Correo electrónico</label>
                  <input 
                    type="email" 
                    value={newPatientForm.email}
                    onChange={(e) => setNewPatientForm({...newPatientForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    placeholder="Ej. jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Teléfono</label>
                  <input 
                    type="tel" 
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({...newPatientForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    placeholder="+34 600..."
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingPatient}
                  className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                  {isSubmittingPatient ? 'Guardando...' : 'Guardar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
