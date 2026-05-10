import React, { useState } from 'react';
import { Plus, Clock, Grid, Pencil, Trash2, X } from 'lucide-react';
import { DashboardViewProps } from './types';
import { useStaffData, createShiftApi, createRoomApi, updateRoomApi, deleteRoomApi } from '../../hooks/useStaffData';

export default function StaffView({ isDarkMode }: DashboardViewProps) {
  const { users, rooms, shifts, refreshStaffData } = useStaffData();

  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false);
  const [newShiftForm, setNewShiftForm] = useState({ userId: '', roomId: '', date: '', startTime: '09:00', endTime: '17:00', type: 'WORK', notes: '' });
  const [isSubmittingShift, setIsSubmittingShift] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState({ name: '' });
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [activeStaffTab, setActiveStaffTab] = useState('cuadrante');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    alert(message);
  };

  const handleAddShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftForm.userId || !newShiftForm.date) return;
    
    setIsSubmittingShift(true);
    try {
      const startDateTime = new Date(`${newShiftForm.date}T${newShiftForm.startTime}`);
      const endDateTime = new Date(`${newShiftForm.date}T${newShiftForm.endTime}`);
      
      await createShiftApi({
        userId: newShiftForm.userId,
        roomId: newShiftForm.roomId || null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: newShiftForm.type,
        notes: newShiftForm.notes
      });
      
      await refreshStaffData();
      setIsAddShiftModalOpen(false);
      setNewShiftForm({ userId: '', roomId: '', date: '', startTime: '09:00', endTime: '17:00', type: 'WORK', notes: '' });
      showToast('Turno añadido con éxito');
    } catch (error) {
      console.error('Error adding shift:', error);
      showToast('Error al generar el turno.', 'error');
    } finally {
      setIsSubmittingShift(false);
    }
  };

  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.name) return;
    
    setIsSubmittingRoom(true);
    try {
      await createRoomApi({ name: newRoomForm.name });
      await refreshStaffData();
      setIsAddRoomModalOpen(false);
      setNewRoomForm({ name: '' });
      showToast('Sala añadida con éxito');
    } catch (error) {
      console.error('Error adding room:', error);
      showToast('Error al generar la sala.', 'error');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleEditRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name) return;
    
    setIsSubmittingRoom(true);
    try {
      await updateRoomApi(editingRoom.id, { name: editingRoom.name });
      await refreshStaffData();
      setIsEditRoomModalOpen(false);
      setEditingRoom(null);
      showToast('Sala actualizada con éxito');
    } catch (error) {
      console.error('Error editing room:', error);
      showToast('Error al actualizar la sala.', 'error');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta sala? Esta acción no se puede deshacer.')) {
      try {
        await deleteRoomApi(id);
        await refreshStaffData();
        showToast('Sala eliminada con éxito');
      } catch (error) {
         showToast('Error al eliminar la sala.', 'error');
      }
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12  pb-24 mt-8 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Personal y Turnos</h1>
          <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Gestiona la disponibilidad, vacaciones y asignación de salas de tu equipo médico.</p>
        </div>
      </div>

      {/* Tab Selection */}
      <div className={`flex items-center border-b mb-6 transition-colors ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
        <button 
          onClick={() => setActiveStaffTab('cuadrante')}
          className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors ${activeStaffTab === 'cuadrante' ? (isDarkMode ? 'border-blue-400 text-white' : 'border-[#5469d4] text-[#5469d4]') : (isDarkMode ? 'border-transparent text-gray-500 hover:text-gray-300' : 'border-transparent text-[#8792a2] hover:text-[#4f566b]')}`}
        >
          Cuadrante Semanal
        </button>
        <button 
          onClick={() => setActiveStaffTab('salas')}
          className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors ${activeStaffTab === 'salas' ? (isDarkMode ? 'border-blue-400 text-white' : 'border-[#5469d4] text-[#5469d4]') : (isDarkMode ? 'border-transparent text-gray-500 hover:text-gray-300' : 'border-transparent text-[#8792a2] hover:text-[#4f566b]')}`}
        >
          Equipos y Salas
        </button>
      </div>

      <div className={`p-6 rounded-[8px] border shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
        
        {activeStaffTab === 'cuadrante' && (
          <>
            <h3 className={`text-[16px] font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Planificación de {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
            
            {/* Shifts Logic Iteration */}
            <div className="space-y-4">
              {users.map(user => {
                const userShifts = shifts.filter(s => s.userId === user.id);
                return (
                  <div key={user.id} className={`flex flex-col md:flex-row p-4 rounded-[6px] border ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
                    <div className="w-full md:w-1/4 mb-4 md:mb-0">
                      <div className="flex gap-3 items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-[#1e293b] text-blue-400' : 'bg-white text-[#5469d4]'}`}>
                          {user.name.charAt(0)}{user.name.split(' ').length > 1 ? user.name.split(' ')[1].charAt(0) : ''}
                        </div>
                        <div>
                          <p className={`font-bold text-[14px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                          <p className={`text-[11px] font-medium uppercase mt-0.5 ${user.role === 'DOCTOR' ? 'text-[#8792a2]' : 'text-purple-500'}`}>{user.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-3/4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Let's render the upcoming shifts or vacations */}
                      {userShifts.length === 0 ? (
                        <div className="col-span-full flex items-center text-[12px] text-gray-500 italic">
                          Sin turnos asignados esta semana
                        </div>
                      ) : (
                        userShifts.map((shift, idx) => {
                           const shiftDate = new Date(shift.startTime);
                           const formattedDate = `${String(shiftDate.getDate()).padStart(2, '0')}/${String(shiftDate.getMonth() + 1).padStart(2, '0')}`;
                           return (
                             <div key={idx} className={`p-3 border-l-4 rounded-r-[4px] shadow-sm ${shift.type === 'VACATION' ? (isDarkMode ? 'border-orange-500 bg-orange-900/20' : 'border-[#e65100] bg-[#fff3e0]') : (isDarkMode ? 'border-blue-500 bg-[#1e293b]' : 'border-[#5469d4] bg-white')}`}>
                               <p className={`text-[11px] font-bold uppercase mb-1 ${shift.type === 'VACATION' ? 'text-orange-500' : (isDarkMode ? 'text-blue-400' : 'text-[#5469d4]')}`}>
                                 {shift.type === 'VACATION' ? 'Vacaciones' : 'Turno Trabajo'}
                               </p>
                               <p className={`text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                 {formattedDate}
                               </p>
                               <div className={`text-[11px] mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                 <Clock className="w-3 h-3"/> 
                                 {new Date(shift.startTime).getHours()}:{new Date(shift.startTime).getMinutes().toString().padStart(2, '0')} - {new Date(shift.endTime).getHours()}:{new Date(shift.endTime).getMinutes().toString().padStart(2, '0')}
                               </div>
                               {shift.roomId && (
                                 <div className={`text-[10px] mt-1.5 inline-block px-1.5 py-0.5 rounded-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                   {rooms.find(r => r.id === shift.roomId)?.name || 'Sala'}
                                 </div>
                               )}
                             </div>
                           );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsAddShiftModalOpen(true)} className="px-4 py-2 bg-[#5469d4] hover:bg-[#4c5ed1] text-white rounded-[4px] text-[13px] font-bold flex items-center gap-2 transition-all">
                <Plus className="w-4 h-4" /> Asignar Turno
              </button>
            </div>
          </>
        )}

        {activeStaffTab === 'salas' && (
          <>
             <div className="flex items-center justify-between mb-4">
               <h3 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Gestión de Espacios y Consultas</h3>
               <button onClick={() => setIsAddRoomModalOpen(true)} className="px-4 py-2 border border-[#5469d4] text-[#5469d4] hover:bg-[#5469d4] hover:text-white rounded-[4px] text-[13px] font-bold flex items-center gap-2 transition-all">
                  <Plus className="w-4 h-4" /> Añadir Sala
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
               {rooms.length === 0 ? (
                 <div className="col-span-full py-8 text-center text-[13px] text-gray-500 italic">No hay salas configuradas.</div>
               ) : rooms.map(room => (
                 <div key={room.id} className={`p-5 rounded-[8px] border transition-colors relative group ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#fcfdff] border-[#e3e8ee] hover:border-[#5469d4]'}`}>
                   
                   {/* Floating actions */}
                   <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setEditingRoom(room);
                         setIsEditRoomModalOpen(true);
                       }} 
                       className={`p-1.5 rounded-[4px] transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#5469d4] hover:bg-[#e3e8ee]'}`}
                     >
                       <Pencil className="w-3.5 h-3.5" />
                     </button>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeleteRoom(room.id);
                       }} 
                       className={`p-1.5 rounded-[4px] text-red-500 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                   </div>

                   <div className="flex items-start justify-between mb-4">
                     <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a] text-blue-400' : 'bg-[#f0f4f8] text-[#5469d4]'}`}>
                        <Grid className="w-6 h-6" />
                     </div>
                     <span className={`px-2 py-1 text-[11px] font-bold rounded-full mr-12 ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>Activa</span>
                   </div>
                   <h4 className={`text-[16px] font-bold mb-1 pr-6 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{room.name}</h4>
                   <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#8792a2]'}`}>ID Interno: {room.id.split('-')[0]}</p>
                 </div>
               ))}
             </div>
          </>
        )}
      </div>

      {/* Add Shift Modal */}
      {isAddShiftModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[12px] shadow-2xl ${isDarkMode ? 'bg-[#1e293b] border border-[#334155]' : 'bg-white'}`}>
            <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
              <h2 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Asignar Turno o Vacaciones</h2>
              <button onClick={() => setIsAddShiftModalOpen(false)} className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddShiftSubmit} className="p-5 space-y-4">
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Personal</label>
                <select 
                  required
                  value={newShiftForm.userId}
                  onChange={e => setNewShiftForm({...newShiftForm, userId: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                >
                  <option value="">Seleccionar miembro...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Tipo</label>
                <select 
                  value={newShiftForm.type}
                  onChange={e => setNewShiftForm({...newShiftForm, type: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                >
                  <option value="WORK">Trabajo</option>
                  <option value="VACATION">Vacaciones / Libre</option>
                  <option value="SICK_LEAVE">Baja Médica</option>
                </select>
              </div>

              {newShiftForm.type === 'WORK' && (
                <div>
                  <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Sala / Consulta (Opcional)</label>
                  <select 
                    value={newShiftForm.roomId}
                    onChange={e => setNewShiftForm({...newShiftForm, roomId: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                  >
                    <option value="">Cualquier sala...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Fecha</label>
                  <input 
                    type="date" 
                    required
                    value={newShiftForm.date}
                    onChange={e => setNewShiftForm({...newShiftForm, date: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Hora Inicio</label>
                  <input 
                    type="time" 
                    required
                    value={newShiftForm.startTime}
                    onChange={e => setNewShiftForm({...newShiftForm, startTime: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                  />
                </div>
                <div>
                  <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Hora Fin</label>
                  <input 
                    type="time" 
                    required
                    value={newShiftForm.endTime}
                    onChange={e => setNewShiftForm({...newShiftForm, endTime: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Notas (Opcional)</label>
                <textarea 
                  value={newShiftForm.notes}
                  onChange={e => setNewShiftForm({...newShiftForm, notes: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors min-h-[60px] ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6 dark:border-[#334155]">
                <button type="button" onClick={() => setIsAddShiftModalOpen(false)} className={`px-4 py-2 bg-transparent text-[14px] font-medium rounded-[4px] border ${isDarkMode ? 'border-[#334155] text-white hover:bg-[#334155]' : 'border-[#e3e8ee] text-[#4f566b] hover:bg-[#f6f9fc]'}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingShift} className="px-4 py-2 bg-[#5469d4] hover:bg-[#4c5ed1] text-white text-[14px] font-medium rounded-[4px] shadow-sm disabled:opacity-50">
                  {isSubmittingShift ? 'Guardando...' : 'Asignar Turno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-[12px] shadow-2xl ${isDarkMode ? 'bg-[#1e293b] border border-[#334155]' : 'bg-white'}`}>
            <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
              <h2 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Añadir Sala</h2>
              <button onClick={() => setIsAddRoomModalOpen(false)} className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRoomSubmit} className="p-5 space-y-4">
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Nombre de la Sala</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Consulta 3"
                  value={newRoomForm.name}
                  onChange={e => setNewRoomForm({...newRoomForm, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6 dark:border-[#334155]">
                <button type="button" onClick={() => setIsAddRoomModalOpen(false)} className={`px-4 py-2 bg-transparent text-[14px] font-medium rounded-[4px] border ${isDarkMode ? 'border-[#334155] text-white hover:bg-[#334155]' : 'border-[#e3e8ee] text-[#4f566b] hover:bg-[#f6f9fc]'}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingRoom} className="px-4 py-2 bg-[#5469d4] hover:bg-[#4c5ed1] text-white text-[14px] font-medium rounded-[4px] shadow-sm disabled:opacity-50">
                  {isSubmittingRoom ? 'Guardando...' : 'Crear Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {isEditRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-[12px] shadow-2xl ${isDarkMode ? 'bg-[#1e293b] border border-[#334155]' : 'bg-white'}`}>
            <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
              <h2 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Editar Sala</h2>
              <button onClick={() => {setIsEditRoomModalOpen(false); setEditingRoom(null);}} className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditRoomSubmit} className="p-5 space-y-4">
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Nombre de la Sala</label>
                <input 
                  type="text" 
                  required
                  value={editingRoom?.name || ''}
                  onChange={e => setEditingRoom({...editingRoom, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6 dark:border-[#334155]">
                <button type="button" onClick={() => {setIsEditRoomModalOpen(false); setEditingRoom(null);}} className={`px-4 py-2 bg-transparent text-[14px] font-medium rounded-[4px] border ${isDarkMode ? 'border-[#334155] text-white hover:bg-[#334155]' : 'border-[#e3e8ee] text-[#4f566b] hover:bg-[#f6f9fc]'}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingRoom} className="px-4 py-2 bg-[#5469d4] hover:bg-[#4c5ed1] text-white text-[14px] font-medium rounded-[4px] shadow-sm disabled:opacity-50">
                  {isSubmittingRoom ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
