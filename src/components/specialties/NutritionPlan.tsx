import { useState } from 'react';
import { Apple, Plus, Trash2, Target } from 'lucide-react';

interface MealEntry {
  id: string;
  name: string;
  foods: string;
}

interface NutritionPlanProps {
  isDarkMode: boolean;
  value?: any;
  onChange: (val: any) => void;
}

const MEAL_PRESETS = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda', 'Post-entreno'];

export function NutritionPlan({ isDarkMode, value, onChange }: NutritionPlanProps) {
  const plan = value && !Array.isArray(value) ? value : { meals: [] as MealEntry[], objetivo: '' };
  const meals: MealEntry[] = plan.meals || [];
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const updateMeal = (id: string, foods: string) => {
    onChange({ ...plan, meals: meals.map(m => m.id === id ? { ...m, foods } : m) });
  };

  const addMeal = (name: string) => {
    const entry: MealEntry = { id: Math.random().toString(36).substr(2, 9), name, foods: '' };
    onChange({ ...plan, meals: [...meals, entry] });
    setShowAdd(false);
    setNewName('');
  };

  const removeMeal = (id: string) => {
    onChange({ ...plan, meals: meals.filter(m => m.id !== id) });
  };

  const updateObjetivo = (val: string) => {
    onChange({ ...plan, objetivo: val });
  };

  return (
    <div className={`p-6 min-h-[600px] ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Plan de Nutrición</h4>
          <p className="text-[12px] text-gray-500">Diseña el plan nutricional del paciente</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[12px] font-bold hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Añadir Comida
        </button>
      </div>

      {showAdd && (
        <div className={`mb-6 p-4 rounded-xl border animate-in fade-in slide-in-from-top-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-wrap gap-2 mb-3">
            {MEAL_PRESETS.filter(p => !meals.some(m => m.name === p)).map(p => (
              <button
                key={p}
                onClick={() => addMeal(p)}
                className="px-3 py-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                + {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="O escribe un nombre personalizado..."
              className={`flex-1 px-3 py-2 rounded-lg border text-[12px] font-bold outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <button
              onClick={() => newName && addMeal(newName)}
              disabled={!newName}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-50 hover:bg-emerald-700 transition-colors"
            >
              Añadir
            </button>
          </div>
        </div>
      )}

      {meals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <Apple className="w-12 h-12 text-gray-400 mb-4" strokeWidth={1} />
          <p className={`text-[13px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Plan vacío</p>
          <p className="text-[11px] text-gray-400 mt-1">Añade comidas al plan nutricional.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {meals.map(meal => (
            <div key={meal.id} className={`border rounded-xl p-4 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h5 className={`text-[13px] font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                  <Apple className="w-3.5 h-3.5 text-emerald-500" /> {meal.name}
                </h5>
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={meal.foods}
                onChange={(e) => updateMeal(meal.id, e.target.value)}
                placeholder={`Describe los alimentos para ${meal.name.toLowerCase()}...`}
                className={`w-full text-[12px] p-3 rounded-lg min-h-[100px] border outline-none transition-colors resize-none ${
                  isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500'
                  : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-emerald-500'
                }`}
              />
            </div>
          ))}
        </div>
      )}

      <div className={`mt-6 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-100'}`}>
        <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>
          <Target className="w-3.5 h-3.5" /> Objetivo y Notas Generales
        </label>
        <textarea
          value={plan.objetivo || ''}
          onChange={(e) => updateObjetivo(e.target.value)}
          placeholder="Ej: Recomponer composición corporal. Déficit calórico moderado (1800 kcal)."
          className={`w-full text-[12px] p-2 rounded-lg border outline-none transition-colors resize-none ${
            isDarkMode
            ? 'bg-amber-900/10 text-amber-200 border-slate-700 focus:bg-amber-900/20'
            : 'bg-amber-100/50 text-amber-900 border-amber-100 focus:bg-amber-100'
          }`}
        />
      </div>
    </div>
  );
}
