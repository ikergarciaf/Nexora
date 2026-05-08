import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Odontogram } from '../../components/specialties/Odontogram';
import { PainMap } from '../../components/specialties/PainMap';
import { NutritionPlan } from '../../components/specialties/NutritionPlan';
import { SessionDiary } from '../../components/specialties/SessionDiary';
import { AestheticGal } from '../../components/specialties/AestheticGal';
import { QuotesManager } from '../../components/specialties/QuotesManager';
import { WeightEvolution } from '../../components/specialties/WeightEvolution';
import { PsychometricTests } from '../../components/specialties/PsychometricTests';
import { VialStock } from '../../components/specialties/VialStock';
import { fetchPatientRecordApi, savePatientRecordApi } from '../../hooks/useDashboardData';
import { DashboardViewProps } from './types';

interface SpecialtyModuleViewProps extends DashboardViewProps {
  activeView: string;
  clinicConfig: any;
}

export default function SpecialtyModuleView({ isDarkMode, activeView, clinicConfig }: SpecialtyModuleViewProps) {
  const [patientRecord, setPatientRecord] = useState<any>({
    odontogram: [],
    painPoints: [],
    nutritionPlan: [],
    quotes: [],
    weightLogs: [],
    psychSessions: [],
    aestheticPhotos: [],
    tests: [],
    vials: [],
    generalNotes: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const selectedPatientId = localStorage.getItem('selected_patient_id');

  useEffect(() => {
    async function loadRecord() {
      if (!selectedPatientId) return;
      const data = await fetchPatientRecordApi(selectedPatientId);
      if (data && data.medicalRecord) {
        setPatientRecord((prev: any) => ({
          ...prev,
          ...(typeof data.medicalRecord === 'string' ? JSON.parse(data.medicalRecord) : data.medicalRecord)
        }));
      }
    }
    loadRecord();
  }, [selectedPatientId]);

  const handleSave = async () => {
    if (!selectedPatientId) return;
    setIsSaving(true);
    const success = await savePatientRecordApi(selectedPatientId, patientRecord);
    setIsSaving(false);
  };

  return (
    <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-[24px] font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </h1>
          <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Módulo especializado para {clinicConfig.specialty}.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#008477] text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Guardar Cambios
        </button>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden min-h-[500px] bg-white ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
        {activeView === 'odontograma' && <Odontogram isDarkMode={isDarkMode} value={patientRecord.odontogram} onChange={(v) => setPatientRecord(prev => ({...prev, odontogram: v}))} />}
        {activeView === 'dietas' && <NutritionPlan isDarkMode={isDarkMode} value={patientRecord.nutritionPlan} onChange={(v) => setPatientRecord(prev => ({...prev, nutritionPlan: v}))} />}
        {activeView === 'mapa_dolor' && <PainMap isDarkMode={isDarkMode} value={patientRecord.painPoints} onChange={(v) => setPatientRecord(prev => ({...prev, painPoints: v}))} />}
        {activeView === 'sesiones' && <SessionDiary isDarkMode={isDarkMode} value={patientRecord.psychSessions} onChange={(v) => setPatientRecord(prev => ({...prev, psychSessions: v}))} />}
        {activeView === 'galeria' && <AestheticGal isDarkMode={isDarkMode} value={patientRecord.aestheticPhotos} onChange={(v) => setPatientRecord(prev => ({...prev, aestheticPhotos: v}))} />}
        {activeView === 'presupuestos' && <QuotesManager isDarkMode={isDarkMode} value={patientRecord.quotes} onChange={(v) => setPatientRecord(prev => ({...prev, quotes: v}))} />}
        {activeView === 'evolucion' && <WeightEvolution isDarkMode={isDarkMode} value={patientRecord.weightLogs} onChange={(v) => setPatientRecord(prev => ({...prev, weightLogs: v}))} />}
        {activeView === 'test' && <PsychometricTests isDarkMode={isDarkMode} value={patientRecord.tests} onChange={(v) => setPatientRecord(prev => ({...prev, tests: v}))} />}
        {activeView === 'stock_estetica' && <VialStock isDarkMode={isDarkMode} value={patientRecord.vials} onChange={(v) => setPatientRecord(prev => ({...prev, vials: v}))} />}
      </div>
    </div>
  );
}
