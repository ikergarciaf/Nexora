import { useState } from 'react';
import { Brain, Plus, Calendar, Clock, Trash2, FileText } from 'lucide-react';

interface Session {
  id: string;
  date: string;
  duration: string;
  summary: string;
}

interface SessionDiaryProps {
  isDarkMode: boolean;
  value?: any;
  onChange: (val: any) => void;
}

export function SessionDiary({ isDarkMode, value, onChange }: SessionDiaryProps) {
  const sessions: Session[] = (value && !Array.isArray(value) && value.sessions) || [];
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState<Partial<Session>>({
    date: new Date().toISOString().split('T')[0],
    duration: '50 min',
    summary: ''
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addSession = () => {
    if (!newSession.summary) return;
    const session: Session = {
      id: Math.random().toString(36).substr(2, 9),
      date: newSession.date || new Date().toISOString().split('T')[0],
      duration: newSession.duration || '50 min',
      summary: newSession.summary
    };
    onChange({ sessions: [...sessions, session] });
    setShowForm(false);
    setNewSession({ date: new Date().toISOString().split('T')[0], duration: '50 min', summary: '' });
  };

  const removeSession = (id: string) => {
    onChange({ sessions: sessions.filter(s => s.id !== id) });
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className={`p-6 min-h-[600px] ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Diario de Sesiones</h4>
          <p className="text-[12px] text-gray-500">Histórico de evolutivo psicológico</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-[12px] font-bold hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nueva Sesión
        </button>
      </div>

      {showForm && (
        <div className={`mb-6 p-5 rounded-xl border animate-in fade-in slide-in-from-top-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={`text-[10px] font-bold uppercase mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha</label>
              <input
                type="date"
                value={newSession.date}
                onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border text-[12px] font-bold outline-none focus:border-violet-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
              />
            </div>
            <div>
              <label className={`text-[10px] font-bold uppercase mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Duración</label>
              <input
                type="text"
                value={newSession.duration}
                onChange={e => setNewSession({ ...newSession, duration: e.target.value })}
                placeholder="50 min"
                className={`w-full px-3 py-2 rounded-lg border text-[12px] font-bold outline-none focus:border-violet-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className={`text-[10px] font-bold uppercase mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Resumen de la Sesión</label>
            <textarea
              value={newSession.summary}
              onChange={e => setNewSession({ ...newSession, summary: e.target.value })}
              placeholder="Describe el progreso, técnicas usadas y observaciones..."
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border text-[12px] outline-none focus:border-violet-500 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-[11px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={addSession} disabled={!newSession.summary} className="px-4 py-2 text-[11px] font-bold bg-violet-600 text-white rounded-lg disabled:opacity-50 hover:bg-violet-700 transition-colors">Guardar Sesión</button>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <FileText className="w-12 h-12 text-gray-400 mb-4" strokeWidth={1} />
          <p className={`text-[13px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Sin sesiones</p>
          <p className="text-[11px] text-gray-400 mt-1">Registra la primera sesión del paciente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className={`border rounded-xl p-4 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <span className={`text-[12px] font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                    <Calendar className="w-3.5 h-3.5 text-violet-500" /> {session.date}
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {session.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                    className="text-[11px] text-violet-600 font-bold hover:underline"
                  >
                    {expandedId === session.id ? 'Ocultar' : 'Ver detalles'}
                  </button>
                  <button
                    onClick={() => removeSession(session.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className={`text-[13px] leading-relaxed line-clamp-2 ${expandedId === session.id ? '' : 'line-clamp-2'} ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                {session.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
