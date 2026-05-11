import { CheckCircle2, Sun, Map, Brain, Sparkles, Stethoscope, Grid, FileText, BarChart, Settings, Clock, Package } from 'lucide-react';

export interface SpecialtyConfig {
  productName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  icon: React.ReactNode;
  specializedItems: { id: string; label: string; icon: React.ReactNode }[];
  kpis: { label: string; key: string; prefix?: string; suffix?: string }[];
  patientModule: string;
}

export const SPECIALTY_MAP: Record<string, SpecialtyConfig> = {
  'Odontología': {
    productName: 'Nexora Dental',
    primaryColor: '#008477',
    secondaryColor: 'bg-[#008477]',
    accentColor: 'text-[#008477]',
    icon: <CheckCircle2 className="w-5 h-5" />,
    specializedItems: [
      { id: 'odontograma', label: 'Odontograma', icon: <Grid className="w-4 h-4" /> },
      { id: 'presupuestos', label: 'Presupuestos', icon: <FileText className="w-4 h-4" /> }
    ],
    kpis: [
      { label: 'Dientes Tratados', key: 'treated', suffix: '' },
      { label: 'Presupuestos Aceptados', key: 'accepted', suffix: '%' }
    ],
    patientModule: 'Odontogram'
  },
  'Nutrición': {
    productName: 'Nexora Nutrición',
    primaryColor: '#059669',
    secondaryColor: 'bg-[#059669]',
    accentColor: 'text-[#059669]',
    icon: <Sun className="w-5 h-5" />,
    specializedItems: [
      { id: 'dietas', label: 'Plan de Dietas', icon: <FileText className="w-4 h-4" /> },
      { id: 'evolucion', label: 'Evolución Peso', icon: <BarChart className="w-4 h-4" /> }
    ],
    kpis: [
      { label: 'Bajada Peso Media', key: 'avgWeight', suffix: 'kg' },
      { label: 'Adherencia Plan', key: 'adherence', suffix: '%' }
    ],
    patientModule: 'NutritionPlan'
  },
  'Fisioterapia': {
    productName: 'Nexora Fisioterapia',
    primaryColor: '#0f172a',
    secondaryColor: 'bg-slate-900',
    accentColor: 'text-slate-900',
    icon: <Map className="w-5 h-5" />,
    specializedItems: [
      { id: 'mapa_dolor', label: 'Mapa de Dolor', icon: <Settings className="w-4 h-4" /> }
    ],
    kpis: [
      { label: 'Sesiones Restantes', key: 'sessions', suffix: '' },
      { label: 'Mejoría Dolor', key: 'recovery', suffix: '%' }
    ],
    patientModule: 'PainMap'
  },
  'Psicología': {
    productName: 'Nexora Psicología',
    primaryColor: '#7c3aed',
    secondaryColor: 'bg-[#7c3aed]',
    accentColor: 'text-[#7c3aed]',
    icon: <Brain className="w-5 h-5" />,
    specializedItems: [
      { id: 'sesiones', label: 'Diario de Sesiones', icon: <Clock className="w-4 h-4" /> },
      { id: 'test', label: 'Tests Psicométricos', icon: <FileText className="w-4 h-4" /> }
    ],
    kpis: [
      { label: 'Sesiones Activas', key: 'activeSessions', suffix: '' },
      { label: 'Nivel Bienestar', key: 'wellbeing', suffix: '/10' }
    ],
    patientModule: 'SessionDiary'
  },
  'Estética': {
    productName: 'Nexora Estética',
    primaryColor: '#db2777',
    secondaryColor: 'bg-[#db2777]',
    accentColor: 'text-[#db2777]',
    icon: <Sparkles className="w-5 h-5" />,
    specializedItems: [
      { id: 'galeria', label: 'Galería Antes/Desc', icon: <Grid className="w-4 h-4" /> },
      { id: 'stock_estetica', label: 'Control VIALES', icon: <Package className="w-4 h-4" /> }
    ],
    kpis: [
      { label: 'Retoques Pendientes', key: 'refill', suffix: '' },
      { label: 'Satisfacción Glow', key: 'glowScore', suffix: '%' }
    ],
    patientModule: 'AestheticGal'
  },
  'Medicina General': {
    productName: 'Nexora Clinical',
    primaryColor: '#5469d4',
    secondaryColor: 'bg-[#5469d4]',
    accentColor: 'text-[#5469d4]',
    icon: <Stethoscope className="w-5 h-5" />,
    specializedItems: [],
    kpis: [],
    patientModule: 'Standard'
  }
};
