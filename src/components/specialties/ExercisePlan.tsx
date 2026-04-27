import React, { useState } from 'react';
import { Plus, Trash2, Dumbbell, PlayCircle, Clock, Save } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  videoUrl?: string;
  notes?: string;
}

interface ExercisePlanProps {
  isDarkMode: boolean;
  value?: Exercise[];
  onChange?: (value: Exercise[]) => void;
}

export const ExercisePlan: React.FC<ExercisePlanProps> = ({ value = [], onChange }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Math.random().toString(36).substring(7),
      name: 'Nuevo Ejercicio',
      sets: 3,
      reps: '10-12',
    };
    onChange?.([...value, newExercise]);
    setSelectedExerciseId(newExercise.id);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    const newExercises = value.map(ex => ex.id === id ? { ...ex, ...updates } : ex);
    onChange?.(newExercises);
  };

  const deleteExercise = (id: string) => {
    const newExercises = value.filter(ex => ex.id !== id);
    if (selectedExerciseId === id) setSelectedExerciseId(null);
    onChange?.(newExercises);
  };

  const selectedExercise = value.find(ex => ex.id === selectedExerciseId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-0 min-h-[600px] bg-white">
      {/* Sidebar List */}
      <div className="flex-[1] flex flex-col border-r border-gray-100 p-6 bg-gray-50/30">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Rutina</h3>
            <button 
              onClick={addExercise}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold shadow-sm transition-transform hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir
            </button>
         </div>

         <div className="space-y-3 overflow-y-auto">
            {value.length === 0 ? (
              <div className="text-center py-12 text-gray-400 opacity-60">
                 <Dumbbell className="w-8 h-8 mx-auto mb-3" strokeWidth={1.5} />
                 <p className="text-[11px] font-medium">No hay ejercicios pautados</p>
              </div>
            ) : (
              value.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`w-full p-4 rounded-2xl flex flex-col gap-2 transition-all border text-left ${selectedExerciseId === ex.id ? 'bg-white border-slate-900 shadow-sm' : 'bg-white border-gray-100 hover:border-slate-300'}`}
                >
                  <div className="text-[13px] font-bold text-slate-800 line-clamp-1">{ex.name}</div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>{ex.sets} Series</span>
                    <span>•</span>
                    <span>{ex.reps} Reps</span>
                  </div>
                </button>
              ))
            )}
         </div>
      </div>

      {/* Editor Main Area */}
      <div className="flex-[2] flex flex-col p-8">
        {selectedExercise ? (
          <div className="space-y-6 max-w-2xl">
             <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-[20px] font-black text-slate-900">Detalle del Ejercicio</h2>
                <button 
                  onClick={() => deleteExercise(selectedExercise.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 border border-red-100 transition-colors"
                  title="Eliminar Ejercicio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>

             <div className="space-y-5">
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Nombre del Ejercicio</label>
                 <input 
                   type="text" 
                   value={selectedExercise.name}
                   onChange={(e) => updateExercise(selectedExercise.id, { name: e.target.value })}
                   className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-slate-900 focus:bg-white transition-colors"
                 />
               </div>

               <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Series</label>
                   <input 
                     type="number" 
                     min="1"
                     value={selectedExercise.sets}
                     onChange={(e) => updateExercise(selectedExercise.id, { sets: parseInt(e.target.value) || 0 })}
                     className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-slate-900 focus:bg-white transition-colors text-center"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Repeticiones</label>
                   <input 
                     type="text" 
                     value={selectedExercise.reps}
                     placeholder="ej. 10-12"
                     onChange={(e) => updateExercise(selectedExercise.id, { reps: e.target.value })}
                     className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-slate-900 focus:bg-white transition-colors text-center"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Duración / Info</label>
                   <input 
                     type="text" 
                     value={selectedExercise.duration || ''}
                     placeholder="ej. 30s descanso"
                     onChange={(e) => updateExercise(selectedExercise.id, { duration: e.target.value })}
                     className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-bold outline-none focus:border-slate-900 focus:bg-white transition-colors text-center"
                   />
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><PlayCircle className="w-3.5 h-3.5" /> URL Video Youtube (Opcional)</label>
                 <input 
                   type="url" 
                   value={selectedExercise.videoUrl || ''}
                   placeholder="https://..."
                   onChange={(e) => updateExercise(selectedExercise.id, { videoUrl: e.target.value })}
                   className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-bold outline-none focus:border-slate-900 focus:bg-white transition-colors text-blue-600"
                 />
                 {selectedExercise.videoUrl && (
                   <div className="mt-3 aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                     <iframe 
                       width="100%" 
                       height="100%" 
                       src={selectedExercise.videoUrl.replace('watch?v=', 'embed/')} 
                       title="Video reproductor"
                       frameBorder="0" 
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                       allowFullScreen
                     ></iframe>
                   </div>
                 )}
               </div>

               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Notas de Ejecución</label>
                 <textarea 
                   value={selectedExercise.notes || ''}
                   onChange={(e) => updateExercise(selectedExercise.id, { notes: e.target.value })}
                   className="w-full h-32 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-slate-900 focus:bg-white transition-colors resize-none"
                   placeholder="Instrucciones específicas para el paciente..."
                 />
               </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <Dumbbell className="w-12 h-12 text-gray-400 mb-4" strokeWidth={1} />
             <h4 className="text-[14px] font-bold mb-1 text-gray-500 uppercase tracking-wider">Plan de Ejercicios</h4>
             <p className="text-[12px] text-gray-400 max-w-[200px]">Selecciona o crea un nuevo ejercicio para pautar.</p>
          </div>
        )}
      </div>
    </div>
  );
};
