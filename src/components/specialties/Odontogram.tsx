import React, { useState } from 'react';
import { Circle, Square, Triangle, Hexagon, User } from 'lucide-react';

interface Tooth {
  id: number;
  status: 'healthy' | 'caries' | 'missing' | 'restored' | 'abscess';
}

interface OdontogramProps {
  isDarkMode: boolean;
  value?: Tooth[];
  onChange?: (value: Tooth[]) => void;
}

export const Odontogram: React.FC<OdontogramProps> = ({ isDarkMode, value = [], onChange }) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // Initial tooth map (Standard adult dentition 1-32 or FDI 11-48)
  // We'll use 11-18, 21-28 (Upper) and 31-38, 41-48 (Lower)
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const getStatus = (id: number) => {
    return value.find(t => t.id === id)?.status || 'healthy';
  };

  const setStatus = (id: number, status: Tooth['status']) => {
    const newVal = [...value];
    const idx = newVal.findIndex(t => t.id === id);
    if (idx >= 0) {
      newVal[idx].status = status;
    } else {
      newVal.push({ id, status });
    }
    onChange?.(newVal);
  };

  const getStatusColor = (status: Tooth['status']) => {
    switch (status) {
      case 'caries': return 'bg-red-50 text-red-600 border-red-200';
      case 'missing': return 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
      case 'restored': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'abscess': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      default: return 'bg-white text-gray-400 border-gray-200';
    }
  };

  const renderTooth = (id: number) => {
    const status = getStatus(id);
    const isSelected = selectedTooth === id;

    return (
      <div 
        key={id}
        onClick={() => setSelectedTooth(id)}
        className={`w-12 h-16 border rounded-xl flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all hover:scale-105 ${isSelected ? 'ring-2 ring-slate-900 shadow-md scale-105' : 'hover:border-slate-300'} ${getStatusColor(status)}`}
      >
        <span className="text-[10px] font-bold opacity-70">{id}</span>
        <div className="flex-1 flex items-center justify-center w-full">
            {status === 'caries' && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
            {status === 'missing' && <span className="text-xl font-bold opacity-50">X</span>}
            {status === 'restored' && <div className="w-5 h-5 rounded-md border-2 border-blue-500 bg-blue-100" />}
            {status === 'abscess' && <div className="w-4 h-4 rotate-45 bg-yellow-400 border-2 border-yellow-500" />}
            {status === 'healthy' && <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-0 min-h-[600px] bg-white">
      {/* Arch Section */}
      <div className="flex-[1.5] flex flex-col gap-10 p-8 justify-center bg-gray-50/30">
        <div className="w-full flex flex-col items-center gap-12">
          {/* Upper Arch */}
          <div className="flex gap-2 w-full justify-center flex-wrap">
            {upperTeeth.map(renderTooth)}
          </div>

          <div className="flex items-center gap-4 w-full max-w-lg">
             <div className="h-[1px] flex-1 bg-gray-200" />
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Planos Oclusales</span>
             <div className="h-[1px] flex-1 bg-gray-200" />
          </div>

          {/* Lower Arch */}
          <div className="flex gap-2 w-full justify-center flex-wrap">
            {lowerTeeth.map(renderTooth)}
          </div>
        </div>
      </div>

      {/* Control Panel Section */}
      <div className="flex-1 max-w-md">
         <div className="h-full flex flex-col rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editor de Pieza</h3>
              {value.length > 0 && (
                <button 
                  onClick={() => { if(confirm('¿Reiniciar odontograma?')) onChange?.([]) }}
                  className="text-[10px] text-gray-400 font-bold hover:text-red-500 transition-colors"
                >
                  Reiniciar
                </button>
              )}
            </div>

            <div className="flex-1 p-6 space-y-8 overflow-y-auto bg-white flex flex-col justify-center">
               {selectedTooth ? (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="text-center mb-6">
                       <h4 className="text-[32px] font-black text-slate-900">#{selectedTooth}</h4>
                       <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pieza Seleccionada</p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Estado Clínico</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'healthy', label: 'Sano', styling: 'bg-gray-50 text-gray-700 hover:border-gray-300' },
                          { id: 'caries', label: 'Caries', styling: 'bg-red-50 text-red-700 hover:border-red-300' },
                          { id: 'restored', label: 'Obturado', styling: 'bg-blue-50 text-blue-700 hover:border-blue-300' },
                          { id: 'abscess', label: 'Absceso', styling: 'bg-yellow-50 text-yellow-700 hover:border-yellow-300' },
                          { id: 'missing', label: 'Ausente', styling: 'bg-gray-100 text-gray-500 hover:border-gray-400' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setStatus(selectedTooth, opt.id as any)}
                            className={`p-4 rounded-2xl text-[12px] font-bold transition-all border ${opt.styling} ${getStatus(selectedTooth) === opt.id ? 'ring-2 ring-slate-900 shadow-sm border-transparent' : 'border-gray-100'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <button 
                        onClick={() => setSelectedTooth(null)}
                        className="w-full py-3 mt-2 text-[11px] bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                      >
                        Cerrar Editor
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center py-20 grayscale opacity-30">
                    <User className="w-8 h-8 text-gray-400 mb-4" strokeWidth={1} />
                    <h4 className="text-[12px] font-bold mb-1 text-gray-500 uppercase tracking-wider">Sin pieza seleccionada</h4>
                    <p className="text-[11px] text-gray-400 max-w-[150px]">Toque un diente en el diagrama para editar su estado.</p>
                 </div>
               )}
            </div>

            {/* Status Summary */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
               <h5 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Resumen Clínico ({value.length})</h5>
               <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {value.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTooth(t.id)}
                      className={`flex-none w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${
                        t.status === 'caries' ? 'bg-red-50 text-red-700 border-red-200' :
                        t.status === 'restored' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        t.status === 'abscess' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        t.status === 'missing' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                        'bg-white text-gray-500 border-gray-200'
                      } ${selectedTooth === t.id ? 'ring-2 ring-slate-900 scale-105' : 'hover:scale-105'}`}
                    >
                      {t.id}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
