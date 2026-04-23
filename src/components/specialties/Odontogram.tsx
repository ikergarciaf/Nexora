import React, { useState } from 'react';
import { Circle, Square, Triangle, Hexagon } from 'lucide-react';

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
      case 'caries': return 'bg-red-500 text-white';
      case 'missing': return 'bg-gray-400 text-white opacity-40';
      case 'restored': return 'bg-blue-500 text-white';
      case 'abscess': return 'bg-yellow-500 text-black';
      default: return isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-white text-gray-700';
    }
  };

  const renderTooth = (id: number) => {
    const status = getStatus(id);
    const isSelected = selectedTooth === id;

    return (
      <div 
        key={id}
        onClick={() => setSelectedTooth(id)}
        className={`w-10 h-14 border rounded-sm flex flex-col items-center justify-between p-1 cursor-pointer transition-all hover:scale-105 ${isSelected ? 'ring-2 ring-blue-500' : ''} ${getStatusColor(status)} ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}
      >
        <span className="text-[9px] font-bold opacity-70">{id}</span>
        <div className="flex-1 flex items-center justify-center">
            {status === 'caries' && <div className="w-2 h-2 rounded-full bg-red-800 animate-pulse" />}
            {status === 'missing' && <span className="text-xl font-bold">X</span>}
            {status === 'restored' && <div className="w-4 h-4 rounded-sm border-2 border-blue-900 bg-blue-400" />}
            {status === 'abscess' && <div className="w-3 h-3 rotate-45 bg-yellow-400 border border-yellow-800" />}
            {status === 'healthy' && <div className="w-3 h-4 border border-current opacity-20 rounded-full" />}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-6 items-center">
        {/* Upper Arch */}
        <div className="flex gap-1 overflow-x-auto pb-2 w-full justify-center">
          {upperTeeth.map(renderTooth)}
        </div>

        <div className={`h-[1px] w-full max-w-md ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />

        {/* Lower Arch */}
        <div className="flex gap-1 overflow-x-auto pb-2 w-full justify-center">
          {lowerTeeth.map(renderTooth)}
        </div>

        {/* Legend / Actions */}
        {selectedTooth && (
          <div className={`mt-4 p-4 rounded-lg border w-full animate-in slide-in-from-bottom-2 duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="text-[13px] font-bold mb-3 flex items-center justify-between">
              Pieza {selectedTooth}
              <button onClick={() => setSelectedTooth(null)} className="text-xs opacity-50 hover:opacity-100">Cerrar</button>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'healthy', label: 'Sano', color: 'bg-gray-100 dark:bg-slate-700' },
                { id: 'caries', label: 'Caries', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
                { id: 'restored', label: 'Obturado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                { id: 'abscess', label: 'Absceso', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { id: 'missing', label: 'Ausente', color: 'bg-gray-200 text-gray-500 dark:bg-slate-600 dark:text-gray-400' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setStatus(selectedTooth, opt.id as any)}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold transition-all hover:scale-105 ${opt.color} ${getStatus(selectedTooth) === opt.id ? 'ring-2 ring-current' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
