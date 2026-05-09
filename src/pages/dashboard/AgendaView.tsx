import React, { useState } from 'react';
import { Grid, Plus, Search, CheckCircle2, MoreHorizontal, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { useDashboardData, createAppointmentApi, updateAppointmentApi, deleteAppointmentApi } from '../../hooks/useDashboardData';
import { DashboardViewProps } from './types';

export default function AgendaView({ isDarkMode }: DashboardViewProps) {
  const { appointments, patients, refreshData } = useDashboardData();

  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] = useState(false);
  const [newAppointmentForm, setNewAppointmentForm] = useState({ patientId: '', date: '', time: '', durationMinutes: 30 });
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);

  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopyLink = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleAddAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointmentForm.patientId || !newAppointmentForm.date || !newAppointmentForm.time) return;
    setIsSubmittingAppointment(true);
    const [year, month, day] = newAppointmentForm.date.split('-');
    const [hours, minutes] = newAppointmentForm.time.split(':');
    const startDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    await createAppointmentApi({
      patientId: newAppointmentForm.patientId,
      startTime: startDateTime.toISOString(),
      durationMinutes: newAppointmentForm.durationMinutes
    });
    await refreshData();
    setNewAppointmentForm({ patientId: '', date: '', time: '', durationMinutes: 30 });
    setIsAddAppointmentModalOpen(false);
    setIsSubmittingAppointment(false);
  };

  const handleEditAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment || !editingAppointment.patientId) return;
    setIsSubmittingAppointment(true);
    const updateData: any = {
      patientId: editingAppointment.patientId,
      durationMinutes: editingAppointment.durationMinutes,
      status: editingAppointment.status
    };
    if (editingAppointment.date && editingAppointment.time) {
      const [year, month, day] = editingAppointment.date.split('-');
      const [hours, minutes] = editingAppointment.time.split(':');
      const startDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
      updateData.startTime = startDateTime.toISOString();
    }
    await updateAppointmentApi(editingAppointment.id, updateData);
    await refreshData();
    setIsEditAppointmentModalOpen(false);
    setIsSubmittingAppointment(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta cita? Esta acción no se puede deshacer.')) {
      await deleteAppointmentApi(id);
      await refreshData();
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12  pb-24 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Agenda de Citas</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const url = `${window.location.origin}/book/demo-clinic`;
              handleCopyLink(url, 'agenda-link');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[4px] font-semibold text-[13px] transition-colors shadow-sm ${copiedStates['agenda-link'] ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400' : isDarkMode ? 'bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:bg-[#f6f9fc]'}`}
          >
            {copiedStates['agenda-link'] ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4 rotate-45" />}
            {copiedStates['agenda-link'] ? '¡Copiado!' : 'Compartir Link Cliente'}
          </button>
          <button
            onClick={() => setIsAddAppointmentModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nueva Cita Int.
          </button>
        </div>
      </div>

      <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          <Search className="w-4 h-4 text-[#8792a2]" />
          <input
            type="text"
            placeholder="Filtrar citas por paciente o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}
          />
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Fecha / Hora</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Paciente</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Servicio</th>
                <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Estado</th>
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Grid className="w-8 h-8 text-[#8792a2] mb-3" />
                      <h3 className={`text-[14px] font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No hay citas todavía</h3>
                      <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Empieza agendando tu primera cita.</p>
                      <button
                        onClick={() => setIsAddAppointmentModalOpen(true)}
                        className="text-[#5469d4] font-semibold text-[13px] hover:underline dark:text-[#a5b4fc]"
                      >
                        Añadir cita
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((apt: any) => (
                  <tr key={apt.id} className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{apt.date}</span>
                        <span className={`text-[12px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{apt.startTime}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                      {apt.patientName}
                    </td>
                    <td className={`px-4 py-3 text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                      {apt.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                        apt.status === 'SCHEDULED' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#e3f2fd] text-[#0d47a1]') :
                        apt.status === 'COMPLETED' ? (isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-[#e8f5e9] text-[#1b5e20]') :
                        (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-[#fff3e0] text-[#e65100]')
                      }`}>
                        {apt.status === 'SCHEDULED' ? 'Programada' : apt.status === 'COMPLETED' ? 'Completada' : apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <div className="relative action-menu-container flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `apt-${apt.id}` ? null : `apt-${apt.id}`); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeDropdown === `apt-${apt.id}` && (
                          <div className={`absolute right-8 top-0 w-32 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                            <button onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(null);
                              const dateStr = new Date().toISOString().split('T')[0];
                              setEditingAppointment({ id: apt.id, patientId: '', durationMinutes: 30, date: dateStr, time: "12:00", status: apt.status });
                              setIsEditAppointmentModalOpen(true);
                            }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeleteAppointment(apt.id); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
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
          <span>Mostrando {appointments.length} resultados</span>
        </div>
      </div>

      {isEditAppointmentModalOpen && editingAppointment && (
        <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1a1f36]">Editar cita</h3>
              <button onClick={() => setIsEditAppointmentModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditAppointmentSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Paciente/Cliente</label>
                  <select
                    required
                    value={editingAppointment.patientId}
                    onChange={(e) => setEditingAppointment({...editingAppointment, patientId: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  >
                    <option value="" disabled>Selecciona un paciente</option>
                    {patients.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Fecha</label>
                    <input
                      type="date"
                      required
                      value={editingAppointment.date}
                      onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
                      className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Hora</label>
                    <input
                      type="time"
                      required
                      value={editingAppointment.time}
                      onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                      className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Estado</label>
                  <select
                    value={editingAppointment.status}
                    onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  >
                    <option value="SCHEDULED">Programada</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Duración (minutos)</label>
                  <select
                    value={editingAppointment.durationMinutes}
                    onChange={(e) => setEditingAppointment({...editingAppointment, durationMinutes: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1.5 horas</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditAppointmentModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAppointment}
                  className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                  {isSubmittingAppointment ? 'Guardando...' : 'Guardar cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddAppointmentModalOpen && (
        <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1a1f36]">Nueva cita</h3>
              <button onClick={() => setIsAddAppointmentModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAppointmentSubmit} className="p-6">
              {patients.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[14px] text-[#4f566b] mb-4">Debes dar de alta a un cliente/paciente antes de poder agendar una cita.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddAppointmentModalOpen(false);
                    }}
                    className="text-[#5469d4] font-semibold text-[13px] hover:underline"
                  >
                    Crear mi primer cliente
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Paciente/Cliente *</label>
                    <select
                      required
                      value={newAppointmentForm.patientId}
                      onChange={(e) => setNewAppointmentForm({...newAppointmentForm, patientId: e.target.value})}
                      className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    >
                      <option value="" disabled>Selecciona un paciente</option>
                      {patients.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Fecha *</label>
                      <input
                        type="date"
                        required
                        value={newAppointmentForm.date}
                        onChange={(e) => setNewAppointmentForm({...newAppointmentForm, date: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Hora (24h) *</label>
                      <input
                        type="time"
                        required
                        value={newAppointmentForm.time}
                        onChange={(e) => setNewAppointmentForm({...newAppointmentForm, time: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Duración (minutos)</label>
                    <select
                      value={newAppointmentForm.durationMinutes}
                      onChange={(e) => setNewAppointmentForm({...newAppointmentForm, durationMinutes: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                    >
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={45}>45 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1.5 horas</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAppointmentModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                >
                  Cancelar
                </button>
                {patients.length > 0 && (
                  <button
                    type="submit"
                    disabled={isSubmittingAppointment}
                    className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingAppointment ? 'Guardando...' : 'Confirmar Cita'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
