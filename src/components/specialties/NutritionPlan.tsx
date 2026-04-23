import React from 'react';
import { Apple, Plus, Search } from 'lucide-react';

interface NutritionPlanProps {
  isDarkMode: boolean;
  value?: any;
  onChange: (val: any) => void;
}

export function NutritionPlan({ isDarkMode, value, onChange }: NutritionPlanProps) {
  const categories = ['Proteínas', 'Carbohidratos', 'Grasas', 'Vegetales', 'Frutas'];
  
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Plan de Nutrición Actual</h4>
          <p className="text-[12px] text-gray-500">Diseña el cuadrante nutricional del paciente</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#059669] text-white rounded-[6px] text-[12px] font-bold">
          <Plus className="w-3.5 h-3.5" /> Nueva Dieta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Desayuno', 'Almuerzo', 'Cena'].map((meal) => (
          <div key={meal} className={`border rounded-[8px] p-4 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <h5 className={`text-[13px] font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
              <Apple className="w-3.5 h-3.5 text-[#059669]" /> {meal}
            </h5>
            <div className={`text-[12px] p-3 rounded-[6px] min-h-[80px] border border-dashed ${isDarkMode ? 'border-[#334155] text-gray-400' : 'border-gray-200 text-gray-500'}`}>
              Sin alimentos asignados...
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-2 text-[11px] font-bold text-[#059669] hover:underline">
              <Plus className="w-3 h-3" /> Añadir alimento
            </button>
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-[8px] border ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-amber-50 border-amber-100'}`}>
        <p className={`text-[12px] font-medium ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>
          <strong>Objetivo:</strong> Recomponer composición corporal. Déficit calórico moderado (1800 kcal).
        </p>
      </div>
    </div>
  );
}
