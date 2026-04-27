import React, { useState } from 'react';
import { Plus, Trash2, FileText, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TestResult {
  id: string;
  testName: string;
  date: string;
  score: number;
  maxScore: number;
  notes?: string;
  categoryScores?: { category: string; score: number; max: number }[];
}

interface PsychometricTestsProps {
  isDarkMode: boolean;
  value?: TestResult[];
  onChange?: (value: TestResult[]) => void;
}

const PREDEFINED_TESTS = [
  { name: 'BDI-II (Depresión)', max: 63, categories: ['Cognitivo', 'Afectivo', 'Somático'] },
  { name: 'BAI (Ansiedad)', max: 63, categories: ['Subjetivo', 'Neurofisiológico', 'Pánico'] },
  { name: 'MCMI-IV (Millon)', max: 115, categories: ['Clínico', 'Personalidad', 'Severidad'] },
  { name: 'Test a Medida', max: 100, categories: ['A', 'B', 'C'] },
];

export const PsychometricTests: React.FC<PsychometricTestsProps> = ({ value = [], onChange }) => {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const addTest = (templateIndex: number = 0) => {
    const template = PREDEFINED_TESTS[templateIndex];
    const newTest: TestResult = {
      id: Math.random().toString(36).substring(7),
      testName: template.name,
      date: new Date().toISOString().split('T')[0],
      score: 0,
      maxScore: template.max,
      categoryScores: template.categories.map(c => ({ category: c, score: 0, max: template.max / template.categories.length }))
    };
    onChange?.([...value, newTest]);
    setSelectedTestId(newTest.id);
  };

  const updateTest = (id: string, updates: Partial<TestResult>) => {
    const newTests = value.map(t => t.id === id ? { ...t, ...updates } : t);
    onChange?.(newTests);
  };

  const deleteTest = (id: string) => {
    const newTests = value.filter(t => t.id !== id);
    if (selectedTestId === id) setSelectedTestId(null);
    onChange?.(newTests);
  };

  const selectedTest = value.find(t => t.id === selectedTestId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-0 min-h-[600px] bg-white">
      {/* Sidebar List */}
      <div className="flex-[1] flex flex-col border-r border-gray-100 p-6 bg-gray-50/30">
         <div className="flex flex-col gap-4 mb-6">
            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Añadir Nuevo Test</h3>
            <div className="grid grid-cols-2 gap-2">
              {PREDEFINED_TESTS.map((t, idx) => (
                 <button
                   key={t.name}
                   onClick={() => addTest(idx)}
                   className="px-3 py-2 bg-white border border-gray-200 text-slate-700 rounded-xl text-[10px] font-bold shadow-sm transition-all hover:border-purple-500 hover:text-purple-600 truncate"
                 >
                   + {t.name}
                 </button>
              ))}
            </div>
         </div>

         <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-4">Historial de Evaluación</h3>
         <div className="space-y-3 overflow-y-auto">
            {value.length === 0 ? (
              <div className="text-center py-12 text-gray-400 opacity-60">
                 <FileText className="w-8 h-8 mx-auto mb-3" strokeWidth={1.5} />
                 <p className="text-[11px] font-medium">No hay tests registrados</p>
              </div>
            ) : (
              value.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTestId(t.id)}
                  className={`w-full p-4 rounded-2xl flex flex-col gap-2 transition-all border text-left ${selectedTestId === t.id ? 'bg-white border-purple-600 shadow-sm ring-1 ring-purple-600' : 'bg-white border-gray-100 hover:border-purple-300'}`}
                >
                  <div className="flex justify-between items-start">
                     <span className="text-[13px] font-bold text-slate-800">{t.testName}</span>
                     <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{t.score}/{t.maxScore}</span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-400">{t.date}</div>
                </button>
              ))
            )}
         </div>
      </div>

      {/* Editor Main Area */}
      <div className="flex-[2] flex flex-col p-8">
        {selectedTest ? (
          <div className="flex flex-col h-full gap-8">
             <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                   <input 
                     type="text"
                     value={selectedTest.testName}
                     onChange={(e) => updateTest(selectedTest.id, { testName: e.target.value })}
                     className="text-[20px] font-black text-slate-900 bg-transparent outline-none focus:border-b-2 border-purple-600 block mb-1"
                   />
                   <input 
                     type="date"
                     value={selectedTest.date}
                     onChange={(e) => updateTest(selectedTest.id, { date: e.target.value })}
                     className="text-[12px] font-bold text-gray-500 bg-transparent outline-none cursor-pointer"
                   />
                </div>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-[10px] font-bold text-purple-600 uppercase">Puntuación Total:</span>
                      <input 
                         type="number"
                         value={selectedTest.score}
                         onChange={(e) => updateTest(selectedTest.id, { score: parseInt(e.target.value) || 0 })}
                         className="w-12 bg-transparent text-[16px] font-black text-slate-900 outline-none text-right"
                      />
                      <span className="text-[14px] font-bold text-gray-400">/ {selectedTest.maxScore}</span>
                   </div>
                   <button 
                     onClick={() => deleteTest(selectedTest.id)}
                     className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 border border-red-100 transition-colors"
                     title="Eliminar Test"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
             </div>

             <div className="flex gap-8 flex-1">
                <div className="flex-1 space-y-6">
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block border-b border-gray-100 pb-2">Desglose por Categoría</label>
                     <div className="space-y-4">
                        {selectedTest.categoryScores?.map((cat, idx) => (
                           <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-2">
                                 <span>{cat.category}</span>
                                 <span className="text-purple-600">{cat.score} / {Math.round(cat.max)}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max={cat.max} 
                                value={cat.score}
                                onChange={(e) => {
                                   const newCats = [...(selectedTest.categoryScores || [])];
                                   newCats[idx].score = parseInt(e.target.value);
                                   updateTest(selectedTest.id, { categoryScores: newCats });
                                }}
                                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                              />
                           </div>
                        ))}
                     </div>
                   </div>

                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block border-b border-gray-100 pb-2">Interpretación Clínica</label>
                     <textarea 
                       value={selectedTest.notes || ''}
                       onChange={(e) => updateTest(selectedTest.id, { notes: e.target.value })}
                       className="w-full h-32 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-purple-500 focus:bg-white transition-colors resize-none leading-relaxed"
                       placeholder="Diagnóstico, percentil o interpretación de los resultados..."
                     />
                   </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border border-gray-100 p-4 min-h-[300px]">
                   {selectedTest.categoryScores && selectedTest.categoryScores.length > 2 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={selectedTest.categoryScores.map(c => ({ subject: c.category, A: c.score, fullMark: c.max }))}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                          <Radar name="Puntuación" dataKey="A" stroke="#9333ea" fill="#a855f7" fillOpacity={0.4} />
                        </RadarChart>
                      </ResponsiveContainer>
                   ) : (
                      <div className="text-center opacity-40">
                         <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                         <p className="text-[12px] font-bold text-slate-500">Gráfico no disponible</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <FileText className="w-12 h-12 text-gray-400 mb-4" strokeWidth={1} />
             <h4 className="text-[14px] font-bold mb-1 text-gray-500 uppercase tracking-wider">Pruebas Psicométricas</h4>
             <p className="text-[12px] text-gray-400 max-w-[200px]">Selecciona o añade un test para ver los resultados.</p>
          </div>
        )}
      </div>
    </div>
  );
};
