import React from 'react';
import { Apple, Plus, Search } from 'lucide-react';

interface NutritionPlanProps {
  isDarkMode: boolean;
  value?: any;
  onChange: (val: any) => void;
}

export function NutritionPlan({ isDarkMode, value, onChange }: NutritionPlanProps) {
  const meals = ['Desayuno', 'Almuerzo', 'Cena'];
  const plan = value || { Desayuno: '', Almuerzo: '', Cena: '', Objetivo: '' };
  
  const updateMeal = (meal: string, content: string) => {
    onChange({ ...plan, [meal]: content });
  };

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Plan de Nutrición Actual</h4>
          <p className="text-[12px] text-gray-500">Diseña el cuadrante nutricional del paciente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <div key={meal} className={`border rounded-[8px] p-4 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <h5 className={`text-[13px] font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
              <Apple className="w-3.5 h-3.5 text-[#059669]" /> {meal}
            </h5>
            <textarea
              value={plan[meal] || ''}
              onChange={(e) => updateMeal(meal, e.target.value)}
              placeholder={`Ingesa alimentos para ${meal.toLowerCase()}...`}
              className={`w-full text-[12px] p-3 rounded-[6px] min-h-[100px] border outline-none transition-colors resize-none ${
                isDarkMode 
                ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#059669]' 
                : 'bg-white border-gray-200 text-gray-700 focus:border-[#059669]'
              }`}
            />
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-[8px] border ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-amber-50 border-amber-100'}`}>
        <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>Objetivo y Notas Generales</label>
        <textarea
          value={plan.Objetivo || ''}
          onChange={(e) => updateMeal('Objetivo', e.target.value)}
          placeholder="Ej: Recomponer composición corporal. Déficit calórico moderado (1800 kcal)."
          className={`w-full text-[12px] p-2 rounded-[4px] border border-transparent outline-none transition-colors resize-none ${
            isDarkMode 
            ? 'bg-amber-900/10 text-amber-200 focus:bg-amber-900/20' 
            : 'bg-amber-100/50 text-amber-900 focus:bg-amber-100'
          }`}
        />
      </div>
    </div>
  );
}
