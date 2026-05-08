import React from 'react';
import { Brain, Plus, Calendar, Clock } from 'lucide-react';

interface SessionDiaryProps {
  isDarkMode: boolean;
  value?: any;
  onChange: (val: any) => void;
}

export function SessionDiary({ isDarkMode, value, onChange }: SessionDiaryProps) {
  const sessions = [
    { date: '10 Abr 2024', duration: '50 min', summary: 'El paciente muestra avances en la gestión de la ansiedad mediante técnicas de respiración.' },
    { date: '03 Abr 2024', duration: '55 min', summary: 'Sesión enfocada en la identificación de disparadores emocionales en el entorno laboral.' }
  ];

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Diario de Sesiones</h4>
          <p className="text-[12px] text-gray-500">Histórico de evolutivo psicológico</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#7c3aed] text-white rounded-[6px] text-[12px] font-bold">
          <Plus className="w-3.5 h-3.5" /> Nueva Sesión
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session, idx) => (
          <div key={idx} className={`border rounded-[8px] p-4 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className={`text-[12px] font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                  <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" /> {session.date}
                </span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {session.duration}
                </span>
              </div>
              <button className="text-[11px] text-[#7c3aed] font-bold hover:underline">Ver detalles</button>
            </div>
            <p className={`text-[13px] leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
              {session.summary}
            </p>
          </div>
        ))}
        
        <div className={`p-8 border border-dashed rounded-[8px] text-center ${isDarkMode ? 'border-[#334155] text-gray-600' : 'border-gray-200 text-gray-400'}`}>
          <p className="text-[12px]">No hay más sesiones registradas para este paciente.</p>
        </div>
      </div>
    </div>
  );
}
