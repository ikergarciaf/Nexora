import React, { useState } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
}

interface WeightEvolutionProps {
  isDarkMode: boolean;
  value?: WeightEntry[];
  onChange?: (value: WeightEntry[]) => void;
}

export const WeightEvolution: React.FC<WeightEvolutionProps> = ({ value = [], onChange }) => {
  const [newEntry, setNewEntry] = useState<Partial<WeightEntry>>({
    date: new Date().toISOString().split('T')[0],
    weight: 70,
  });

  const addEntry = () => {
    if (!newEntry.weight || !newEntry.date) return;
    
    const entry: WeightEntry = {
      id: Math.random().toString(36).substring(7),
      date: newEntry.date,
      weight: Number(newEntry.weight),
      bodyFat: newEntry.bodyFat ? Number(newEntry.bodyFat) : undefined,
      muscleMass: newEntry.muscleMass ? Number(newEntry.muscleMass) : undefined,
    };

    const updatedValue = [...value, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    onChange?.(updatedValue);
    setNewEntry({ ...newEntry, weight: entry.weight });
  };

  const removeEntry = (id: string) => {
    onChange?.(value.filter(v => v.id !== id));
  };

  const sortedData = [...value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const calculateChange = () => {
    if (sortedData.length < 2) return 0;
    const first = sortedData[0].weight;
    const last = sortedData[sortedData.length - 1].weight;
    return last - first;
  };

  const change = calculateChange();

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-0 min-h-[600px] bg-white">
      {/* Sidebar List */}
      <div className="flex-[1] flex flex-col border-r border-gray-100 p-6 bg-gray-50/30">
        <div className="mb-6 space-y-4">
          <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Nuevo Registro</h3>
          <div className="space-y-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold outline-none focus:border-green-600 transition-colors"
                autoFocus={false}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newEntry.weight || ''}
                onChange={(e) => setNewEntry({ ...newEntry, weight: parseFloat(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold outline-none focus:border-green-600 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">% Grasa</label>
                <input
                  type="number"
                  step="0.1"
                  value={newEntry.bodyFat || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, bodyFat: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold outline-none focus:border-green-600 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">% Músculo</label>
                <input
                  type="number"
                  step="0.1"
                  value={newEntry.muscleMass || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, muscleMass: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold outline-none focus:border-green-600 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={addEntry}
              disabled={!newEntry.weight || !newEntry.date}
              className="w-full mt-2 py-2.5 bg-green-600 text-white rounded-xl text-[12px] font-bold shadow-sm disabled:opacity-50 hover:bg-green-700 transition-colors"
            >
              Añadir Registro
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Historial</h3>
           {sortedData.slice().reverse().map((entry, idx, arr) => {
             const prevEntry = arr[idx + 1];
             const diff = prevEntry ? entry.weight - prevEntry.weight : 0;
             return (
               <div key={entry.id} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${diff < 0 ? 'bg-green-50 text-green-600' : diff > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                        {diff < 0 ? <TrendingDown className="w-4 h-4" /> : diff > 0 ? <TrendingUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                     </div>
                     <div>
                        <div className="text-[13px] font-bold text-slate-800">{entry.weight.toFixed(1)} kg</div>
                        <div className="text-[10px] text-gray-400">{entry.date}</div>
                     </div>
                  </div>
                  <button onClick={() => removeEntry(entry.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
             );
           })}
        </div>
      </div>

      {/* Editor Main Area */}
      <div className="flex-[2] flex flex-col p-8">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h2 className="text-[20px] font-black text-slate-900">Evolución de Peso</h2>
               <p className="text-[12px] text-gray-500 font-medium">Progreso antropométrico del paciente</p>
            </div>
            {sortedData.length > 1 && (
               <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${change <= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {change <= 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  <div>
                     <span className="text-[11px] uppercase tracking-widest font-bold opacity-70 block">Progreso Total</span>
                     <span className="text-[16px] font-black">{Math.abs(change).toFixed(1)} kg</span>
                  </div>
               </div>
            )}
         </div>

         <div className="flex-1 bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px]">
            {sortedData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} tickMargin={10} axisLine={false} tickLine={false} />
                     <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
                     />
                     <Line 
                        type="monotone" 
                        dataKey="weight" 
                        name="Peso (kg)"
                        stroke="#059669" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6, strokeWidth: 0 }} 
                     />
                     {sortedData.some(d => d.bodyFat) && (
                        <Line 
                           type="monotone" 
                           dataKey="bodyFat" 
                           name="% Grasa"
                           stroke="#f59e0b" 
                           strokeWidth={3}
                           dot={false}
                        />
                     )}
                     {sortedData.some(d => d.muscleMass) && (
                        <Line 
                           type="monotone" 
                           dataKey="muscleMass" 
                           name="% Músculo"
                           stroke="#3b82f6" 
                           strokeWidth={3}
                           dot={false}
                        />
                     )}
                  </LineChart>
               </ResponsiveContainer>
            ) : (
               <div className="text-center opacity-40">
                  <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Sin datos</p>
                  <p className="text-[11px] text-gray-400 mt-1">Añade registros para visualizar la evolución.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
