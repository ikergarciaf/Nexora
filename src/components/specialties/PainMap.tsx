import React, { useState, useRef } from 'react';
import { ShieldAlert as AlertCircle, RotateCcw, User, Eye, EyeOff, Rotate3d, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PainPoint {
  id: string;
  x: number; // 0-100 relative to the current view section
  y: number; // 0-100 relative to the current view section
  angle: number; // Discrete角度: 0 (Front), 90 (Right), 180 (Back), 270 (Left)
  intensity: number; // 1-10
  notes: string;
}

interface PainMapProps {
  isDarkMode: boolean;
  value?: PainPoint[];
  onChange?: (value: PainPoint[]) => void;
}

type ViewType = 0 | 90 | 180 | 270;

const VIEW_LABELS: Record<ViewType, string> = {
  0: 'Vista Frontal',
  90: 'Vista Lateral (Derecha)',
  180: 'Vista Posterior',
  270: 'Vista Lateral (Izquierda)'
};

// Realistic anatomical image from User
const MUSCULAR_IMAGE_URL = 'https://www.lifeder.com/wp-content/uploads/2020/11/sistema-muscular-lifeder-ilustracion-min-1024x763.jpg';

export const PainMap: React.FC<PainMapProps> = ({ isDarkMode, value = [], onChange }) => {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [currentAngle, setCurrentAngle] = useState<ViewType>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: PainPoint = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      angle: currentAngle,
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

  const getBackgroundPosition = (angle: ViewType) => {
    switch(angle) {
      case 0: return '0% center';
      case 180: return '50% center';
      case 90: return '100% center';
      case 270: return '100% center';
      default: return '0% center';
    }
  };

  const selectedPoint = value.find(p => p.id === selectedPointId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-0 min-h-[600px] bg-white">
      {/* Body Canvas Section */}
      <div className="flex-[1.5] flex flex-col items-center gap-6 justify-center bg-gray-50/30">
        {/* Rotation Controls - Clean & Neutral */}
        <div className="w-full flex p-1 bg-white rounded-2xl border border-gray-100 max-w-[280px] shadow-sm">
           {( [0, 90, 180, 270] as ViewType[]).map(angle => (
             <button
               key={angle}
               onClick={() => setCurrentAngle(angle)}
               className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${currentAngle === angle ? 'bg-slate-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
             >
               {angle === 0 ? 'Front' : angle === 180 ? 'Back' : angle === 90 ? 'Der' : 'Izq'}
             </button>
           ))}
        </div>

        <div className="relative w-full flex justify-center py-4">
          <motion.div 
            ref={containerRef}
            onClick={handleContainerClick}
            className={`relative w-[280px] aspect-[1/2.1] rounded-3xl border cursor-crosshair transition-all duration-300 overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}
          >
            {/* Realistic Background Image - Restricted Proportions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAngle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${MUSCULAR_IMAGE_URL})`,
                  backgroundSize: '300% 100%',
                  backgroundPosition: getBackgroundPosition(currentAngle),
                  transform: currentAngle === 270 ? 'scaleX(-1)' : 'none',
                }}
              />
            </AnimatePresence>
            
            {/* Minimal Overlay for visibility */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none" />

            {/* Render Points */}
            {value.filter(p => p.angle === currentAngle).map(point => (
              <motion.div 
                key={point.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={(e) => { e.stopPropagation(); setSelectedPointId(point.id); }}
                style={{ 
                  left: `${point.x}%`, 
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`absolute w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all z-10 ${selectedPointId === point.id ? 'ring-4 ring-slate-800 scale-110 shadow-lg' : 'hover:scale-110'}`}
              >
                 <div 
                   className={`w-full h-full rounded-full border-2 border-white shadow-md flex items-center justify-center text-[12px] font-black ${selectedPointId === point.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}
                 >
                   {point.intensity}
                 </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Control Panel Section - SaaS Style */}
      <div className="flex-1 max-w-md">
         <div className={`h-full flex flex-col rounded-3xl border bg-white dark:bg-slate-900 overflow-hidden ${isDarkMode ? 'border-slate-800 shadow-2xl' : 'border-gray-100 shadow-sm'}`}>
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exploración</h3>
              {value.length > 0 && (
                <button 
                  onClick={() => { if(confirm('¿Reiniciar?')) onChange?.([]) }}
                  className="text-[10px] text-gray-400 font-bold hover:text-red-500 transition-colors"
                >
                  Reiniciar
                </button>
              )}
            </div>

            <div className="flex-1 p-6 space-y-8 overflow-y-auto bg-white">
               {selectedPoint ? (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-6"
                 >
                    <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase mb-4 block tracking-widest">Intensidad</label>
                       <div className="flex items-center gap-6">
                           <input 
                             type="range" min="1" max="10" 
                             value={selectedPoint.intensity}
                             onChange={(e) => updatePoint(selectedPoint.id, { intensity: parseInt(e.target.value) })}
                             className="flex-1 h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-slate-800"
                           />
                           <span className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center text-lg font-bold">
                             {selectedPoint.intensity}
                           </span>
                       </div>
                    </div>

                    <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Notas Clínicas</label>
                       <textarea 
                         value={selectedPoint.notes}
                         onChange={(e) => updatePoint(selectedPoint.id, { notes: e.target.value })}
                         className="w-full p-4 border border-gray-100 rounded-2xl text-[12px] outline-none transition-all focus:border-slate-300 resize-none bg-gray-50 text-gray-800"
                         placeholder="Describa el síntoma..."
                         rows={4}
                       />
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => removePoint(selectedPoint.id)}
                        className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                      >
                        Eliminar Hallazgo
                      </button>
                      <button 
                        onClick={() => setSelectedPointId(null)}
                        className="w-full py-2 mt-2 text-[10px] text-gray-400 font-bold hover:text-gray-600 transition-colors"
                      >
                        Cerrar Editor
                      </button>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center py-20 grayscale opacity-30">
                    <User className="w-8 h-8 text-gray-400 mb-4" strokeWidth={1} />
                    <h4 className="text-[12px] font-bold mb-1 text-gray-500 uppercase tracking-wider">Sin hallazgo</h4>
                    <p className="text-[11px] text-gray-400 max-w-[150px]">Toque una zona anatómica para comenzar.</p>
                 </div>
               )}
            </div>

            {/* Minimal Summary List */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
               <h5 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Registros ({value.length})</h5>
               <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {value.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setSelectedPointId(p.id);
                        setCurrentAngle(p.angle as ViewType);
                      }}
                      className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all ${selectedPointId === p.id ? 'bg-slate-800 text-white border-slate-800 scale-105 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-slate-300'}`}
                    >
                      {p.intensity}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

