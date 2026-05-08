import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, User, Calendar, Wallet, FileText, Plus } from 'lucide-react';
import { useDashboardData, fetchPatientRecordApi, savePatientRecordApi } from '../../hooks/useDashboardData';
import { Odontogram } from '../../components/specialties/Odontogram';
import { PainMap } from '../../components/specialties/PainMap';
import { NutritionPlan } from '../../components/specialties/NutritionPlan';
import { SessionDiary } from '../../components/specialties/SessionDiary';
import { AestheticGal } from '../../components/specialties/AestheticGal';
import type { DashboardViewProps } from './types';

interface ClinicalHistoryViewProps extends DashboardViewProps {
  clinicConfig: any;
  onBack: () => void;
}

export default function ClinicalHistoryView({ isDarkMode, clinicConfig, onBack }: ClinicalHistoryViewProps) {
  const { patients } = useDashboardData();
  const selectedPatientId = localStorage.getItem('selected_patient_id');
  const patient = patients.find((p: any) => p.id === selectedPatientId);

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
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [activeRecordTab, setActiveRecordTab] = useState<'specialty' | 'nutrition'>('specialty');
  const [aiNotesInput, setAiNotesInput] = useState('');
  const [aiNotesResult, setAiNotesResult] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  useEffect(() => {
    async function loadRecord() {
      if (!selectedPatientId) return;
      const data = await fetchPatientRecordApi(selectedPatientId);
      if (data && data.medicalRecord) {
        setPatientRecord((prev: any) => ({
          ...prev,
          ...(typeof data.medicalRecord === 'string' ? JSON.parse(data.medicalRecord) : data.medicalRecord)
        }));
      } else {
        setPatientRecord({
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
      }
    }
    loadRecord();
  }, [selectedPatientId]);

  const handleGenerateSummary = async () => {
    if (!aiNotesInput) return;
    setIsGeneratingNotes(true);
    const { generatePatientSummary } = await import('../../hooks/useDashboardData');
    const res = await generatePatientSummary(aiNotesInput);
    if (res) setAiNotesResult(res);
    setIsGeneratingNotes(false);
  };

  const handleSavePatientRecord = async () => {
    if (!selectedPatientId) return;
    setIsSavingRecord(true);
    const success = await savePatientRecordApi(selectedPatientId, patientRecord);
    if (success) {
      console.log('Registro clínico guardado con éxito.');
    } else {
      console.error('Error al guardar el registro clínico.');
    }
    setIsSavingRecord(false);
  };

  if (!patient) return <div className={`px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1440px] mx-auto pb-24 mt-8 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No se encontró el paciente</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1440px] mx-auto pb-24 mt-8 transition-all animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-slate-100 text-gray-500'}`}
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h1 className={`text-[24px] font-bold tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
            Ficha Médica: {patient.fullName}
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-blue-900/20 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              {clinicConfig.specialty}
            </span>
          </h1>
          <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Editando historial clínico y evolución del paciente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`border rounded-[12px] shadow-sm overflow-hidden transition-colors flex flex-col ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className={`px-5 py-2 border-b flex items-center justify-between transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-slate-50 border-[#e3e8ee]'}`}>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setActiveRecordTab('specialty')}
                  className={`px-4 py-3 text-[13px] font-bold transition-all border-b-2 ${activeRecordTab === 'specialty' ? 'border-[#5469d4] text-[#5469d4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {clinicConfig.specialty}
                </button>
                <button 
                  onClick={() => setActiveRecordTab('nutrition')}
                  className={`px-4 py-3 text-[13px] font-bold transition-all border-b-2 ${activeRecordTab === 'nutrition' ? 'border-[#5469d4] text-[#5469d4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Nutrición
                </button>
              </div>
              <div className="hidden sm:block text-[11px] font-medium text-gray-400">Autoguardado: 12:45</div>
            </div>
            <div className="p-0 flex-1">
              {activeRecordTab === 'nutrition' ? (
                <NutritionPlan 
                  isDarkMode={isDarkMode}
                  value={patientRecord.nutritionPlan}
                  onChange={(val) => setPatientRecord({...patientRecord, nutritionPlan: val})}
                />
              ) : clinicConfig.specialty === 'Odontología' ? (
                <Odontogram 
                  isDarkMode={isDarkMode} 
                  value={patientRecord.odontogram} 
                  onChange={(val) => setPatientRecord({...patientRecord, odontogram: val})} 
                />
              ) : clinicConfig.specialty === 'Fisioterapia' ? (
                <PainMap 
                  isDarkMode={isDarkMode} 
                  value={patientRecord.painPoints}
                  onChange={(val) => setPatientRecord({...patientRecord, painPoints: val})}
                />
              ) : clinicConfig.specialty === 'Nutrición' ? (
                <NutritionPlan 
                  isDarkMode={isDarkMode} 
                  value={patientRecord.nutritionPlan}
                  onChange={(val) => setPatientRecord({...patientRecord, nutritionPlan: val})}
                />
              ) : clinicConfig.specialty === 'Psicología' ? (
                <SessionDiary 
                  isDarkMode={isDarkMode} 
                  value={patientRecord.psychSessions}
                  onChange={(val) => setPatientRecord({...patientRecord, psychSessions: val})}
                />
              ) : clinicConfig.specialty === 'Estética' ? (
                <AestheticGal 
                  isDarkMode={isDarkMode} 
                  value={patientRecord.aestheticPhotos}
                  onChange={(val) => setPatientRecord({...patientRecord, aestheticPhotos: val})}
                />
              ) : (
                <div className={`p-12 text-center flex flex-col items-center gap-4 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white shadow-sm'}`}>
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Módulo de {clinicConfig.specialty}</p>
                    <p className="text-[13px] text-gray-500 max-w-xs mx-auto mt-1">Este módulo está optimizado para flujos de {clinicConfig.specialty.toLowerCase()}.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`border rounded-[12px] shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className={`px-5 py-4 border-b transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-slate-50 border-[#e3e8ee]'}`}>
              <h3 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Notas de Evolución</h3>
            </div>
            <div className="p-5">
              <textarea 
                value={patientRecord.generalNotes}
                onChange={(e) => setPatientRecord({...patientRecord, generalNotes: e.target.value})}
                className={`w-full p-4 border rounded-[8px] text-[14px] outline-none min-h-[150px] transition-colors focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white' : 'bg-[#fcfdff] border-[#e3e8ee] text-[#1a1f36]'}`}
                placeholder="Añade detalles sobre el tratamiento de hoy, evolución del paciente, etc..."
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleSavePatientRecord}
                  disabled={isSavingRecord}
                  className="px-4 py-2 bg-[#5469d4] text-white rounded-[6px] text-[13px] font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> {isSavingRecord ? 'Guardando...' : 'Guardar Entrada'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`border rounded-[12px] shadow-sm p-6 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <h4 className={`text-[14px] font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Infomación rápida</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Paciente</p>
                  <p className={`text-[13px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{patient.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Antigüedad</p>
                  <p className={`text-[13px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Feb 2024 (14 meses)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-green-400' : 'bg-green-50 text-green-600'}`}>
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Saldo Pendiente</p>
                  <p className={`text-[13px] font-bold text-red-500`}>120,00 €</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2.5 border border-dashed border-gray-300 rounded-[8px] text-[12px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
              Ver Expediente Completo
            </button>
            <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}></div>
          </div>

          <div className={`border rounded-[12px] shadow-sm p-6 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <h4 className={`text-[14px] font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Archivos y RX</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`aspect-square rounded-[8px] border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-[10px] font-bold opacity-60">Analitica_oct.pdf</span>
              </div>
              <div className={`aspect-square rounded-[8px] border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] font-bold opacity-40">Subir nuevo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
