import React, { useState } from 'react';
import { ShieldAlert as AlertCircle, RotateCcw, User, Eye, EyeOff } from 'lucide-react';

interface PainPoint {
  id: string;
  x: number;
  y: number;
  view: 'front' | 'back';
  intensity: number; // 1-10
  notes: string;
}

interface PainMapProps {
  isDarkMode: boolean;
  value?: PainPoint[];
  onChange?: (value: PainPoint[]) => void;
}

export const PainMap: React.FC<PainMapProps> = ({ isDarkMode, value = [], onChange }) => {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: PainPoint = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      view: currentView,
      intensity: 5,
      notes: ''
    };

    const newVal = [...value, newPoint];
    onChange?.(newVal);
    setSelectedPointId(newPoint.id);
  };

  const updatePoint = (id: string, updates: Partial<PainPoint>) => {
    const newVal = value.map(p => p.id === id ? { ...p, ...updates } : p);
    onChange?.(newVal);
  };

  const removePoint = (id: string) => {
    onChange?.(value.filter(p => p.id !== id));
    setSelectedPointId(null);
  };

  const selectedPoint = value.find(p => p.id === selectedPointId);

  // SVG Paths for a realistic silhouette (More detailed anatomical indicative paths)
  const HumanBodySVG = ({ view }: { view: 'front' | 'back' }) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full ${isDarkMode ? 'fill-slate-800 stroke-slate-700' : 'fill-slate-100 stroke-gray-300'}`} strokeWidth="0.4">
      {view === 'front' ? (
        <path d="M50,5 c-6,0 -10,4 -10,12 c0,8 4,12 10,12 s10,-4 10,-12 c0,-8 -4,-12 -10,-12 Z 
                 M40,29 c-8,2 -18,8 -18,20 v40 c0,15 10,10 10,25 v65 c0,10 5,15 10,15 s10,-5 10,-15 v-45 h4 v45 c0,10 5,15 10,15 s10,-5 10,-15 v-65 c0,-15 10,-10 10,-25 v-40 c0,-12 -10,-18 -18,-20 c-2,10 -10,10 -12,10 s-10,0 -12,-10 Z
                 M22,49 c-4,0 -8,5 -8,15 v45 c0,10 4,15 8,15 s8,-5 8,-15 v-45 c0,-10 -4,-15 -8,-15 Z
                 M78,49 c4,0 8,5 8,15 v45 c0,10 -4,15 -8,15 s-8,-5 -8,-15 v-45 c0,-10 4,-15 8,-15 Z
                 M45,100 c0,0 5,5 10,0 M47,60 c0,0 3,2 6,0 M40,75 c0,0 10,5 20,0" />
      ) : (
        <path d="M50,5 c-6,0 -10,4 -10,12 c0,8 4,12 10,12 s10,-4 10,-12 c0,-8 -4,-12 -10,-12 Z 
                 M40,29 c-8,2 -18,8 -18,20 v40 c0,15 10,10 10,25 v65 c0,10 5,15 10,15 s10,-5 10,-15 v-45 h4 v45 c0,10 5,15 10,15 s10,-5 10,-15 v-65 c0,-15 10,-10 10,-25 v-40 c0,-12 -10,-18 -18,-20 c-2,10 -10,10 -12,10 s-10,0 -12,-10 Z
                 M22,49 c-4,0 -8,5 -8,15 v45 c0,10 4,15 8,15 s8,-5 8,-15 v-45 c0,-10 -4,-15 -8,-15 Z
                 M78,49 c4,0 8,5 8,15 v45 c0,10 -4,15 -8,15 s-8,-5 -8,-15 v-45 c0,-10 4,-15 8,-15 Z
                 M45,45 c0,0 5,10 10,0 M40,65 q10,15 20,0 M42,105 l8,15 l8,-15 Z" fillRule="evenodd" />
      )}
    </svg>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-h-[85vh] overflow-hidden">
      {/* Body Canvas Section */}
      <div className="relative flex-[1.5] flex flex-col items-center">
        {/* View Switcher */}
        <div className="absolute top-0 right-0 z-20 flex bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
          <button 
            onClick={() => setCurrentView('front')}
            className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${currentView === 'front' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            VISTA FRONTAL
          </button>
          <button 
            onClick={() => setCurrentView('back')}
            className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${currentView === 'back' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            VISTA POSTERIOR
          </button>
        </div>

        <div 
          className={`relative w-full max-w-[400px] aspect-[1/2] rounded-3xl border-2 flex items-center justify-center cursor-crosshair transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' : 'bg-white border-gray-200 shadow-lg'}`}
          onClick={handleContainerClick}
        >
          {/* Anatomical Background */}
          <div className="absolute inset-0 p-8 flex items-center justify-center opacity-80 pointer-events-none">
             <HumanBodySVG view={currentView} />
          </div>
          
          <div className="text-[10px] uppercase tracking-widest text-gray-400 pointer-events-none group-hover:opacity-100 opacity-20 transition-opacity absolute bottom-8 left-1/2 -translate-x-1/2 text-center font-bold">
            Toca para marcar lesión
          </div>

          {/* Render Points for current view */}
          {value.filter(p => p.view === currentView).map(point => (
            <div 
              key={point.id}
              onClick={(e) => { e.stopPropagation(); setSelectedPointId(point.id); }}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-125 z-10 ${selectedPointId === point.id ? 'ring-4 ring-blue-500 shadow-2xl scale-110' : 'hover:ring-2 hover:ring-white/50'}`}
            >
               <div 
                 className={`w-full h-full rounded-full border-2 border-white shadow-xl flex items-center justify-center text-[11px] font-black text-white relative`}
                 style={{ backgroundColor: `rgb(${Math.min(255, point.intensity * 25.5)}, ${255 - point.intensity * 25.5}, 50)` }}
               >
                 {point.intensity}
                 {/* Pulse shadow for high intensity */}
                 {point.intensity > 7 && (
                   <div className="absolute inset-0 rounded-full animate-ping bg-red-500/30 -z-10" />
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel Section */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
         <div className="flex items-center justify-between">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-tighter">Detalles Clínicos</h3>
           {value.length > 0 && (
             <button 
               onClick={() => { if(confirm('¿Borrar todos los puntos?')) onChange?.([]) }}
               className="text-[10px] flex items-center gap-1 text-red-400 hover:text-red-500"
             >
               <RotateCcw className="w-3 h-3" /> Reiniciar
             </button>
           )}
         </div>

         <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {selectedPoint ? (
              <div className={`p-5 rounded-2xl border animate-in fade-in slide-in-from-bottom-4 duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-2xl' : 'bg-slate-50 border-gray-200 shadow-md'}`}>
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black">Zona de Dolor</p>
                        <p className="text-[13px] font-bold">Punto #{selectedPoint.id.slice(0,4)}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedPointId(null)} className="p-2 hover:bg-black/5 rounded-full">
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    </button>
                 </div>
                 
                 <div className="space-y-5">
                   <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase">Intensidad</label>
                        <span className="text-[14px] font-black text-blue-500">{selectedPoint.intensity}/10</span>
                     </div>
                     <input 
                       type="range" min="0" max="10" 
                       value={selectedPoint.intensity}
                       onChange={(e) => updatePoint(selectedPoint.id, { intensity: parseInt(e.target.value) })}
                       className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                     />
                     <div className="flex justify-between mt-1 text-[9px] text-gray-400 font-bold uppercase">
                        <span>Leve</span>
                        <span>Moderado</span>
                        <span>Crítico</span>
                     </div>
                   </div>

                   <div>
                     <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase">Notas de Exploración</label>
                     <textarea 
                       value={selectedPoint.notes}
                       onChange={(e) => updatePoint(selectedPoint.id, { notes: e.target.value })}
                       className={`w-full p-3 border rounded-xl text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200'}`}
                       placeholder="Describe el tipo de dolor, irradiación, etc..."
                       rows={4}
                     />
                   </div>

                   <button 
                     onClick={() => removePoint(selectedPoint.id)}
                     className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all active:scale-95"
                   >
                     Eliminar Registro
                   </button>
                 </div>
              </div>
            ) : (
              <div className={`p-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center group ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'}`}>
                 <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <User className="w-8 h-8 text-slate-500 opacity-30" />
                 </div>
                 <h4 className="text-[14px] font-bold mb-2">Editor del Mapa</h4>
                 <p className="text-[12px] text-gray-400 max-w-[200px]">Selecciona o toca una zona del cuerpo para iniciar la evaluación del dolor.</p>
              </div>
            )}

            {/* List Table */}
            <div className="space-y-3">
               <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                 Historial de Hallazgos
                 <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">{value.length}</span>
               </h5>
               <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                 {value.length === 0 && <p className="text-[11px] italic text-gray-400">No hay puntos marcados en esta sesión.</p>}
                 {value.map(p => (
                   <div 
                     key={p.id} 
                     onClick={() => {
                        setSelectedPointId(p.id);
                        setCurrentView(p.view);
                     }}
                     className={`p-3 rounded-xl cursor-pointer flex items-center justify-between group transition-all border ${selectedPointId === p.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                   >
                     <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]" 
                          style={{ backgroundColor: `rgb(${Math.min(255, p.intensity * 25.5)}, ${255 - p.intensity * 25.5}, 50)` }} 
                        />
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {p.view === 'front' ? 'Lado Frontal' : 'Lado Posterior'}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-black">Intensidad {p.intensity}</span>
                        </div>
                     </div>
                     <Eye className={`w-4 h-4 text-blue-500 transition-opacity ${selectedPointId === p.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                   </div>
                 ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
