import React, { useState } from 'react';
import { User, ShieldAlert as AlertCircle } from 'lucide-react';

interface PainPoint {
  id: string;
  x: number;
  y: number;
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

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: PainPoint = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
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

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4">
      {/* Body Canvas */}
      <div className="relative flex-1 max-w-[300px] mx-auto group">
        <div 
          className={`aspect-[1/2] rounded-2xl border-2 flex items-center justify-center cursor-crosshair transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-gray-200'}`}
          onClick={handleContainerClick}
        >
          {/* Faux Body SVG outlines */}
          <div className="absolute inset-0 p-4 opacity-10 pointer-events-none">
             <User className="w-full h-full" strokeWidth={0.5} />
          </div>
          
          <div className="text-[11px] text-gray-400 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            Haz clic para marcar zona de dolor
          </div>

          {/* Render Points */}
          {value.map(point => (
            <div 
              key={point.id}
              onClick={(e) => { e.stopPropagation(); setSelectedPointId(point.id); }}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-10 ${selectedPointId === point.id ? 'ring-4 ring-blue-500' : ''}`}
            >
               <div 
                 className={`w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white`}
                 style={{ backgroundColor: `rgb(${Math.min(255, point.intensity * 25)}, 50, 50)` }}
               >
                 {point.intensity}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 space-y-4">
         {selectedPoint ? (
           <div className={`p-4 rounded-xl border animate-in slide-in-from-right-4 duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h4 className="text-[14px] font-bold mb-4 flex items-center justify-between">
                 Detalle del Punto
                 <button onClick={() => setSelectedPointId(null)} className="text-xs text-gray-500">Cerrar</button>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Intensidad (0-10)</label>
                  <input 
                    type="range" min="0" max="10" 
                    value={selectedPoint.intensity}
                    onChange={(e) => updatePoint(selectedPoint.id, { intensity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Notas / Observaciones</label>
                  <textarea 
                    value={selectedPoint.notes}
                    onChange={(e) => updatePoint(selectedPoint.id, { notes: e.target.value })}
                    className={`w-full p-2 border rounded text-[13px] outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200'}`}
                    placeholder="Ej. Dolor punzante al rotar..."
                    rows={3}
                  />
                </div>

                <button 
                  onClick={() => removePoint(selectedPoint.id)}
                  className="w-full py-2 text-[12px] font-bold text-red-500 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                >
                  Eliminar Punto
                </button>
              </div>
           </div>
         ) : (
           <div className={`p-8 rounded-xl border border-dashed text-center ${isDarkMode ? 'border-slate-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
              <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-[13px]">Selecciona o añade un punto en el mapa para ver los detalles.</p>
           </div>
         )}

         {/* Summary List */}
         <div className="space-y-2">
            <h5 className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Puntos registrados: {value.length}</h5>
            <div className="max-h-[200px] overflow-y-auto pr-2">
              {value.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPointId(p.id)}
                  className={`p-2 rounded mb-1 cursor-pointer flex items-center justify-between group transition-colors ${selectedPointId === p.id ? 'bg-blue-500/10 border-blue-500/30 border' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `rgb(${Math.min(255, p.intensity * 25)}, 50, 50)` }} />
                     <span className={`text-[12px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                       Intensidad {p.intensity}
                     </span>
                  </div>
                  <span className="text-[11px] text-gray-400 truncate max-w-[100px]">{p.notes || 'Sin notas'}</span>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
};
