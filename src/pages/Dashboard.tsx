import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Wallet, ArrowRightLeft, Users, Package, CreditCard, FileText, BarChart, MoreHorizontal, 
  Code, Search, Grid, HelpCircle, Bell, Settings, Plus, ChevronDown, CheckCircle2, Info, X, Map, User, LogOut, ArrowRight, Menu, Mail, Phone, Pencil, Trash2, Download, Sun, Moon, Brain, Rocket, Clock, Calendar, Video, Mic, MicOff, VideoOff, PhoneCall, Sparkles, Stethoscope
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { useDashboardData, createPatientApi, createAppointmentApi, updatePatientApi, deletePatientApi, updateAppointmentApi, deleteAppointmentApi } from '../hooks/useDashboardData';
import { useStaffData, createShiftApi, deleteShiftApi, createRoomApi, updateRoomApi, deleteRoomApi } from '../hooks/useStaffData';
import { NexoraLogo } from '../components/NexoraLogo';
import { TelemedicineRoom } from '../components/TelemedicineRoom';
import { Odontogram } from '../components/specialties/Odontogram';
import { PainMap } from '../components/specialties/PainMap';
import { NutritionPlan } from '../components/specialties/NutritionPlan';
import { SessionDiary } from '../components/specialties/SessionDiary';
import { AestheticGal } from '../components/specialties/AestheticGal';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats, appointments, patients, refreshData } = useDashboardData();
  const { users, rooms, shifts, refreshStaffData } = useStaffData();

  const [activeView, setActiveView] = useState('inicio');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNexoraAiOpen, setIsNexoraAiOpen] = useState(false);

  // Clinic Configuration State
  const [clinicConfig, setClinicConfig] = useState({
    name: localStorage.getItem('clinic-name') || 'Nexora Clinic',
    plan: localStorage.getItem('clinic-plan') || 'Pro',
    specialty: localStorage.getItem('clinic-specialty') || 'Odontología', // Default to Dentistry as requested
    owner: 'Iker',
    email: 'ikergarciafdez1@gmail.com',
    address: 'Calle Principal 123, Madrid',
    phone: '+34 600 000 000',
    aiEnabled: true,
    autoSummaries: false,
    appointmentInterval: 30,
    openingHours: JSON.parse(localStorage.getItem('clinic-hours') || JSON.stringify([
      { day: 'Lunes', open: '09:00', close: '20:00', closed: false },
      { day: 'Martes', open: '09:00', close: '20:00', closed: false },
      { day: 'Miércoles', open: '09:00', close: '20:00', closed: false },
      { day: 'Jueves', open: '09:00', close: '20:00', closed: false },
      { day: 'Viernes', open: '09:00', close: '20:00', closed: false },
      { day: 'Sábado', open: '10:00', close: '14:00', closed: false },
      { day: 'Domingo', open: '00:00', close: '00:00', closed: true },
    ]))
  });

  const SPECIALTY_MAP: Record<string, {
    productName: string,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string,
    icon: React.ReactNode,
    specializedItems: { id: string, label: string, icon: React.ReactNode }[],
    kpis: { label: string, key: string, prefix?: string, suffix?: string }[],
    patientModule: string
  }> = {
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
      productName: 'Nexora Physio',
      primaryColor: '#2563eb',
      secondaryColor: 'bg-[#2563eb]',
      accentColor: 'text-[#2563eb]',
      icon: <Map className="w-5 h-5" />,
      specializedItems: [
        { id: 'mapa_dolor', label: 'Mapa de Dolor', icon: <Settings className="w-4 h-4" /> },
        { id: 'ejercicios', label: 'Pautas Ejercicios', icon: <Video className="w-4 h-4" /> }
      ],
      kpis: [
        { label: 'Sesiones Restantes', key: 'sessions', suffix: '' },
        { label: 'Mejoría Dolor', key: 'recovery', suffix: '%' }
      ],
      patientModule: 'PainMap'
    },
    'Psicología': {
      productName: 'Nexora Psico',
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
      productName: 'Nexora Glow',
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
      productName: 'Nexora Health',
      primaryColor: '#5469d4',
      secondaryColor: 'bg-[#5469d4]',
      accentColor: 'text-[#5469d4]',
      icon: <Stethoscope className="w-5 h-5" />,
      specializedItems: [],
      kpis: [],
      patientModule: 'Standard'
    }
  };

  const currentSpecialtyConfig = useMemo(() => {
    return SPECIALTY_MAP[clinicConfig.specialty] || SPECIALTY_MAP['Medicina General'];
  }, [clinicConfig.specialty]);

  const updateClinicConfig = useCallback((newConfig: Partial<typeof clinicConfig>) => {
    setClinicConfig(prev => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.name) localStorage.setItem('clinic-name', newConfig.name);
      if (newConfig.plan) localStorage.setItem('clinic-plan', newConfig.plan);
      if (newConfig.specialty) localStorage.setItem('clinic-specialty', newConfig.specialty);
      if (newConfig.openingHours) localStorage.setItem('clinic-hours', JSON.stringify(newConfig.openingHours));
      return updated;
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specialtyParam = params.get('specialty');
    if (specialtyParam) {
      let mappedSpecialty = '';
      if (specialtyParam === 'dental') mappedSpecialty = 'Odontología';
      else if (specialtyParam === 'nutricion') mappedSpecialty = 'Nutrición';
      else if (specialtyParam === 'fisioterapia') mappedSpecialty = 'Fisioterapia';
      else if (specialtyParam === 'psicologos') mappedSpecialty = 'Psicología';
      else if (specialtyParam === 'estetica') mappedSpecialty = 'Estética';
      else if (specialtyParam === 'general') mappedSpecialty = 'Medicina General';
      
      if (mappedSpecialty) {
        updateClinicConfig({ specialty: mappedSpecialty });
      }
    }
  }, [location.search, updateClinicConfig]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const globalAddRef = useRef<HTMLDivElement>(null);
  const periodMenuRef = useRef<HTMLDivElement>(null);
  const resumenPeriodMenuRef = useRef<HTMLDivElement>(null);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('clinic-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('clinic-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [activePeriod, setActivePeriod] = useState('Mensual');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [activeResumenPeriod, setActiveResumenPeriod] = useState('Últimos 7 días');
  const [isResumenPeriodMenuOpen, setIsResumenPeriodMenuOpen] = useState(false);
  const [isPatientsMenuOpen, setIsPatientsMenuOpen] = useState(false);
  const [activeDiarioPeriod, setActiveDiarioPeriod] = useState('Diario');
  const [isDiarioMenuOpen, setIsDiarioMenuOpen] = useState(false);
  const [isCompareMenuOpen, setIsCompareMenuOpen] = useState(false);
  const [activePrevPeriod, setActivePrevPeriod] = useState('Período anterior');
  const [isPrevPeriodMenuOpen, setIsPrevPeriodMenuOpen] = useState(false);
  const [isCompareActive, setIsCompareActive] = useState(false);
  
  // Header Dropdowns
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [isToolbarAddOpen, setIsToolbarAddOpen] = useState(false);
  const toolbarAddRef = useRef<HTMLDivElement>(null);
  const patientsMenuRef = useRef<HTMLDivElement>(null);
  const diarioMenuRef = useRef<HTMLDivElement>(null);
  const compareMenuRef = useRef<HTMLDivElement>(null);
  const prevPeriodMenuRef = useRef<HTMLDivElement>(null);
  
  // Add Patient Modal State
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ fullName: '', email: '', phone: '' });
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Edit Patient Modal State
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  // Add Appointment Modal State
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] = useState(false);
  const [newAppointmentForm, setNewAppointmentForm] = useState({ patientId: '', date: '', time: '', durationMinutes: 30 });
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);

  // Edit Appointment Modal State
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  // Staff & Shifts State
  const [activeStaffTab, setActiveStaffTab] = useState<'cuadrante' | 'salas'>('cuadrante');
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false);
  const [newShiftForm, setNewShiftForm] = useState({ userId: '', roomId: '', date: '', startTime: '09:00', endTime: '17:00', type: 'WORK', notes: '' });
  const [isSubmittingShift, setIsSubmittingShift] = useState(false);

  // Room State
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [newRoomForm, setNewRoomForm] = useState({ name: '' });
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);

  // Services Local State
  const [localServices, setLocalServices] = useState([
    { id: 'serv-1', name: 'Primera Visita / Evaluación', description: 'Diagnóstico general y elaboración de presupuesto', category: 'Diagnóstico', duration: 30, price: 0 },
    { id: 'serv-2', name: 'Higiene Dental Completa', description: '', category: 'Prevención', duration: 45, price: 60 },
    { id: 'serv-3', name: 'Blanqueamiento Láser', description: '', category: 'Estética', duration: 60, price: 250 },
  ]);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [newServiceForm, setNewServiceForm] = useState({ name: '', description: '', category: '', duration: 30, price: 0 });

  // Telemedicine State
  const [activeTelemedicineCall, setActiveTelemedicineCall] = useState<any>(null);

  // Patient Clinical Record State
  const [patientRecord, setPatientRecord] = useState<any>({
    odontogram: [
      { id: 11, status: 'healthy' },
      { id: 12, status: 'caries' },
      { id: 13, status: 'healthy' },
      { id: 21, status: 'restored' },
    ],
    painPoints: [
      { id: 'p1', x: 45, y: 30, intensity: 8, notes: 'Dolor lumbar agudo tras esfuerzo físico.' },
      { id: 'p2', x: 55, y: 45, intensity: 4, notes: 'Molestia leve en zona cervical.' }
    ],
    nutritionPlan: {
       desayuno: ['Avena con frutos rojos', 'Café sin azúcar'],
       almuerzo: ['Pechuga de pollo a la plancha', 'Arroz integral', 'Brocoli al vapor'],
       cena: ['Ensalada mixta', 'Pescado blanco', 'Infusión']
    },
    psychSessions: [
       { date: '22 Abr 2026', duration: '50 min', summary: 'El paciente muestra avances significativos en la gestión de la ansiedad social.' },
       { date: '15 Abr 2026', duration: '55 min', summary: 'Primer contacto y evaluación del entorno familiar.' }
    ],
    aestheticPhotos: [
       { type: 'Antes', date: '01 Mar 2026', url: 'https://images.unsplash.com/photo-1512413316925-fd4b93f31521?w=400&auto=format&fit=crop&q=60' },
       { type: 'Después', date: '20 Abr 2026', url: 'https://images.unsplash.com/photo-1512413316925-fd4b93f31521?w=400&auto=format&fit=crop&q=60' }
    ],
    generalNotes: "Paciente colaborador con buena predisposición al tratamiento."
  });

  // Copy Link States
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleCopyLink = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Formatters
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  
  useEffect(() => {
    refreshStaffData();
  }, [refreshStaffData]);

  // Close the popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (periodMenuRef.current && !periodMenuRef.current.contains(event.target as Node)) {
        setIsPeriodMenuOpen(false);
      }
      if (resumenPeriodMenuRef.current && !resumenPeriodMenuRef.current.contains(event.target as Node)) {
        setIsResumenPeriodMenuOpen(false);
      }
      if (patientsMenuRef.current && !patientsMenuRef.current.contains(event.target as Node)) {
        setIsPatientsMenuOpen(false);
      }
      if (diarioMenuRef.current && !diarioMenuRef.current.contains(event.target as Node)) {
        setIsDiarioMenuOpen(false);
      }
      if (compareMenuRef.current && !compareMenuRef.current.contains(event.target as Node)) {
        setIsCompareMenuOpen(false);
      }
      if (prevPeriodMenuRef.current && !prevPeriodMenuRef.current.contains(event.target as Node)) {
        setIsPrevPeriodMenuOpen(false);
      }
      if (toolbarAddRef.current && !toolbarAddRef.current.contains(event.target as Node)) {
        setIsToolbarAddOpen(false);
      }
      if (globalAddRef.current && !globalAddRef.current.contains(event.target as Node)) {
        setIsGlobalAddOpen(false);
      }
      // Close action menus if clicked outside
      if (!(event.target as Element).closest('.action-menu-container')) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuRef]);

  const handleMenuClick = (view: string) => {
    setActiveView(view);
    setIsSidebarOpen(false);
    setIsGlobalAddOpen(false);
  };

  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.fullName) return;
    
    setIsSubmittingPatient(true);
    await createPatientApi(newPatientForm);
    await refreshData();
    setNewPatientForm({ fullName: '', email: '', phone: '' });
    setIsAddPatientModalOpen(false);
    setIsSubmittingPatient(false);
  };

  const handleEditPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient || !editingPatient.fullName) return;
    
    setIsSubmittingPatient(true);
    await updatePatientApi(editingPatient.id, {
      fullName: editingPatient.fullName,
      email: editingPatient.email,
      phone: editingPatient.phone
    });
    await refreshData();
    setIsEditPatientModalOpen(false);
    setIsSubmittingPatient(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
      await deletePatientApi(id);
      await refreshData();
    }
  };

  const handleGeneratePortalLink = async (patientId: string) => {
    try {
      const response = await fetch(`/api/portal/generate/${patientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('clinic_token') || 'demo-token'}`
        }
      });
      if (response.ok) {
        const { token } = await response.json();
        const portalUrl = `${window.location.origin}/portal/${token}`;
        
        handleCopyLink(portalUrl, `portal-${patientId}`);
        
      } else {
        const err = await response.json();
        window.alert('Error al generar el enlace: ' + (err.error || 'Desconocido'));
      }
    } catch (e) {
      console.error(e);
      window.alert('Error de red al generar enlace.');
    }
  };

  const handleAddShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftForm.userId || !newShiftForm.date) return;
    
    setIsSubmittingShift(true);
    try {
      const startDateTime = new Date(`${newShiftForm.date}T${newShiftForm.startTime}`);
      const endDateTime = new Date(`${newShiftForm.date}T${newShiftForm.endTime}`);
      
      await createShiftApi({
        userId: newShiftForm.userId,
        roomId: newShiftForm.roomId || null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: newShiftForm.type,
        notes: newShiftForm.notes
      });
      
      await refreshStaffData();
      setIsAddShiftModalOpen(false);
      setNewShiftForm({ userId: '', roomId: '', date: '', startTime: '09:00', endTime: '17:00', type: 'WORK', notes: '' });
    } catch (error) {
      console.error('Error adding shift:', error);
      alert('Error al generar el turno.');
    } finally {
      setIsSubmittingShift(false);
    }
  };

  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.name) return;
    
    setIsSubmittingRoom(true);
    try {
      await createRoomApi({ name: newRoomForm.name });
      await refreshStaffData();
      setIsAddRoomModalOpen(false);
      setNewRoomForm({ name: '' });
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Error al generar la sala.');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleEditRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name) return;
    
    setIsSubmittingRoom(true);
    try {
      await updateRoomApi(editingRoom.id, { name: editingRoom.name });
      await refreshStaffData();
      setIsEditRoomModalOpen(false);
      setEditingRoom(null);
    } catch (error) {
      console.error('Error editing room:', error);
      alert('Error al actualizar la sala.');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta sala? Esta acción no se puede deshacer.')) {
      try {
        await deleteRoomApi(id);
        await refreshStaffData();
      } catch (error) {
         alert('Error al eliminar la sala.');
      }
    }
  };

  const handleDownloadInvoicePDF = (invoiceInfo: any) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('FACTURA', 14, 22);
    
    doc.setFontSize(14);
    doc.text('Nexora Clinic', 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha: ${invoiceInfo.date}`, 14, 42);
    doc.text(`Nº Factura: ${invoiceInfo.number}`, 14, 48);
    doc.text(`Cliente: ${invoiceInfo.client}`, 14, 54);
    
    autoTable(doc, {
      startY: 65,
      head: [['Descripción', 'Cantidad', 'Precio', 'Total']],
      body: [
        ['Tratamiento General', '1', invoiceInfo.amount, invoiceInfo.amount],
      ],
      theme: 'grid',
      headStyles: { fillColor: [84, 105, 212] }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 65;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total a pagar: ${invoiceInfo.amount}`, 14, finalY + 15);
    
    doc.save(`factura_${invoiceInfo.number}.pdf`);
  };

  const handleAddAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointmentForm.patientId || !newAppointmentForm.date || !newAppointmentForm.time) return;
    
    setIsSubmittingAppointment(true);
    
    // Combine date and time
    const [year, month, day] = newAppointmentForm.date.split('-');
    const [hours, minutes] = newAppointmentForm.time.split(':');
    const startDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));

    await createAppointmentApi({
      patientId: newAppointmentForm.patientId,
      startTime: startDateTime.toISOString(),
      durationMinutes: newAppointmentForm.durationMinutes
    });
    
    await refreshData();
    setNewAppointmentForm({ patientId: '', date: '', time: '', durationMinutes: 30 });
    setIsAddAppointmentModalOpen(false);
    setIsSubmittingAppointment(false);
  };

  const handleEditAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment || !editingAppointment.patientId) return;
    
    setIsSubmittingAppointment(true);
    const updateData: any = {
      patientId: editingAppointment.patientId,
      durationMinutes: editingAppointment.durationMinutes,
      status: editingAppointment.status
    };
    if (editingAppointment.date && editingAppointment.time) {
      const [year, month, day] = editingAppointment.date.split('-');
      const [hours, minutes] = editingAppointment.time.split(':');
      const startDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
      updateData.startTime = startDateTime.toISOString();
    }
    
    await updateAppointmentApi(editingAppointment.id, updateData);
    await refreshData();
    setIsEditAppointmentModalOpen(false);
    setIsSubmittingAppointment(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta cita? Esta acción no se puede deshacer.')) {
      await deleteAppointmentApi(id);
      await refreshData();
    }
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.name) return;
    setLocalServices(prev => [...prev, { ...newServiceForm, id: `serv-${Date.now()}` }]);
    setIsAddServiceModalOpen(false);
    setNewServiceForm({ name: '', description: '', category: '', duration: 30, price: 0 });
  };

  const handleEditServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name) return;
    setLocalServices(prev => prev.map(s => s.id === editingService.id ? editingService : s));
    setIsEditServiceModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este servicio? Esta acción no se puede deshacer.')) {
      setLocalServices(prev => prev.filter(s => s.id !== id));
    }
  };

  // AI Automation States
  const [aiNotesInput, setAiNotesInput] = useState('');
  const [aiNotesResult, setAiNotesResult] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const [aiDraftInput, setAiDraftInput] = useState({ patientName: '', appointmentType: '', time: '', goal: 'reminder' as 'reminder'|'follow_up'|'reactivation' });
  const [aiDraftResult, setAiDraftResult] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const handleGenerateSummary = async () => {
    if (!aiNotesInput) return;
    setIsGeneratingNotes(true);
    const { generatePatientSummary } = await import('../hooks/useDashboardData');
    const res = await generatePatientSummary(aiNotesInput);
    if(res) setAiNotesResult(res);
    setIsGeneratingNotes(false);
  };

  const handleGenerateDraft = async () => {
    if (!aiDraftInput.patientName) return;
    setIsGeneratingDraft(true);
    const { generateWhatsAppDraft } = await import('../hooks/useDashboardData');
    const res = await generateWhatsAppDraft(aiDraftInput.patientName, aiDraftInput.appointmentType, aiDraftInput.time, aiDraftInput.goal);
    if(res) setAiDraftResult(res);
    setIsGeneratingDraft(false);
  };

  // Contextual AI Insights
  const reactivationCandidates = useMemo(() => {
    const now = new Date();
    return patients.filter((p: any) => {
      if (!p.lastVisit) return false;
      const lastVisitDate = new Date(p.lastVisit);
      const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return diffMonths >= 6;
    });
  }, [patients]);

  const renderContent = () => {
    if (activeView === 'historial_clinico') {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (!patient) return <div>No se encontró el paciente</div>;

      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-all animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setActiveView('pacientes')}
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
              {/* Specialized Component based on Specialty */}
              <div className={`border rounded-[12px] shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-slate-50 border-[#e3e8ee]'}`}>
                   <h3 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                     {clinicConfig.specialty === 'Odontología' ? 'Odontograma Interactivo' : 
                      clinicConfig.specialty === 'Fisioterapia' ? 'Mapa de Dolor Palpable' :
                      clinicConfig.specialty === 'Nutrición' ? 'Seguimiento Antropométrico' :
                      clinicConfig.specialty === 'Psicología' ? 'Línea de Vida y Sesiones' :
                      clinicConfig.specialty === 'Estética' ? 'Protocolo Tratamiento Estético' :
                      'Historia Clínica General'}
                   </h3>
                   <div className="text-[11px] font-medium text-gray-500">Última actualización: Hoy</div>
                </div>
                <div className="p-0">
                  {clinicConfig.specialty === 'Odontología' ? (
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
                         {currentSpecialtyConfig.icon}
                      </div>
                      <div>
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Módulo de {clinicConfig.specialty}</p>
                        <p className="text-[13px] text-gray-500 max-w-xs mx-auto mt-1">Este módulo está optimizado para flujos de {clinicConfig.specialty.toLowerCase()}.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* General Observations */}
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
                      <button className="px-4 py-2 bg-[#5469d4] text-white rounded-[6px] text-[13px] font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Guardar Entrada
                      </button>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Quick Info Sidebar */}
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
              </div>

              {/* Digital Assets */}
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

    if (activeView === 'automatizaciones' || activeView === 'nexora_ai') {
      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="mb-8">
            <h1 className={`text-[24px] font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
              <span className={`w-8 h-8 rounded-[4px] flex items-center justify-center transition-colors ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#e3e8ee] text-[#5469d4]'}`}>
                <Brain className="w-5 h-5" />
              </span>
              Nexora Intelligence 
            </h1>
            <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Automatiza tareas rutinarias y extrae valor de tus datos médicos con IA Generativa.</p>
          </div>

          {reactivationCandidates.length > 0 && (
            <div className={`mb-8 p-4 border rounded-[8px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-800/50' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center mt-0.5 ${isDarkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-[#5469d4]'}`}>
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-[15px] font-bold ${isDarkMode ? 'text-blue-100' : 'text-[#1a1f36]'}`}>Sugerencia de Contexto Inteligente</h4>
                  <p className={`text-[13px] mt-0.5 ${isDarkMode ? 'text-blue-200' : 'text-[#4f566b]'}`}>
                    Hemos detectado que <strong>{reactivationCandidates[0].fullName}</strong> no viene desde hace más de 6 meses. ¿Quieres enviarle un mensaje de reactivación?
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAiDraftInput({
                    patientName: reactivationCandidates[0].fullName,
                    appointmentType: 'Revisión General',
                    time: 'Pronto',
                    goal: 'reactivation'
                  });
                  window.scrollTo({ top: document.getElementById('ai-whatsapp-tool')?.offsetTop! - 100, behavior: 'smooth' });
                }}
                className={`shrink-0 px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-[#5469d4] text-white hover:bg-[#4c5ed1]'}`}
              >
                Cargar en Generador
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* HERRAMIENTA 1: Whatsapp OutReach */}
            <div id="ai-whatsapp-tool" className={`border rounded-[8px] shadow-sm flex flex-col h-full overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <div className={`p-5 border-b transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
                <h3 className={`text-[16px] font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                  <Mail className="w-4 h-4 text-[#5469d4]" /> Generador de WhatsApp
                </h3>
                <p className={`text-[12px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Diseña mensajes personalizados que convierten y reactivan.</p>
              </div>
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[12px] font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Nombre Paciente</label>
                    <input type="text" value={aiDraftInput.patientName} onChange={e=>setAiDraftInput({...aiDraftInput, patientName: e.target.value})} className={`w-full px-3 py-2 border rounded-[4px] text-[13px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`} placeholder="Ej. Marta" />
                  </div>
                  <div>
                    <label className={`block text-[12px] font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Objetivo del mensaje</label>
                    <select value={aiDraftInput.goal} onChange={e=>setAiDraftInput({...aiDraftInput, goal: e.target.value as any})} className={`w-full px-3 py-2 border rounded-[4px] text-[13px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}>
                      <option value="reminder" className={isDarkMode ? 'bg-[#0f172a]' : ''}>Recordatorio de cita</option>
                      <option value="follow_up" className={isDarkMode ? 'bg-[#0f172a]' : ''}>Seguimiento Post-Tratamiento</option>
                      <option value="reactivation" className={isDarkMode ? 'bg-[#0f172a]' : ''}>Campaña de Reactivación</option>
                    </select>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[12px] font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Tratamiento / Visita</label>
                      <input type="text" value={aiDraftInput.appointmentType} onChange={e=>setAiDraftInput({...aiDraftInput, appointmentType: e.target.value})} className={`w-full px-3 py-2 border rounded-[4px] text-[13px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`} placeholder="Limpieza dental..." />
                    </div>
                    <div>
                      <label className={`block text-[12px] font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Fecha / Hora context</label>
                      <input type="text" value={aiDraftInput.time} onChange={e=>setAiDraftInput({...aiDraftInput, time: e.target.value})} className={`w-full px-3 py-2 border rounded-[4px] text-[13px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`} placeholder="Mañana a las 10:00" />
                    </div>
                  </div>
                </div>

                <button onClick={handleGenerateDraft} disabled={isGeneratingDraft || !aiDraftInput.patientName} className="w-full mt-2 py-2 bg-[#5469d4] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#4c5ed1] transition-all disabled:opacity-50 active:scale-95 shadow-md">
                  {isGeneratingDraft ? 'Generando Magia...' : 'Generar Borrador'}
                </button>

                {aiDraftResult && (
                  <div className={`mt-4 p-4 border rounded-[6px] relative transition-colors ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-[#f8fcfb] border-[#a6ebd3]'}`}>
                    <p className={`text-[13px] italic ${isDarkMode ? 'text-blue-200' : 'text-[#1b4d3e]'}`}>"{aiDraftResult}"</p>
                    <button onClick={()=>{handleCopyLink(aiDraftResult, 'ai-draft');}} className={`absolute top-2 right-2 text-[11px] font-bold ${copiedStates['ai-draft'] ? 'text-green-600' : 'text-[#5469d4] hover:underline'}`}>
                      {copiedStates['ai-draft'] ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* HERRAMIENTA 2: AI Notes SOAP */}
            <div className={`border rounded-[8px] shadow-sm flex flex-col h-full overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <div className={`p-5 border-b transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
                <h3 className={`text-[16px] font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                  <FileText className="w-4 h-4 text-[#5469d4]" /> Estructurador de Notas Inteligente
                </h3>
                <p className={`text-[12px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Escribe notas aleatorias. Las ordenaremos como historial accionable.</p>
              </div>
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="flex-1">
                  <label className={`block text-[12px] font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>Notas en bruto (Dictado o texto suelto)</label>
                  <textarea 
                    value={aiNotesInput} 
                    onChange={e=>setAiNotesInput(e.target.value)} 
                    className={`w-full h-24 px-3 py-2 border rounded-[4px] text-[13px] outline-none transition-colors resize-none ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`} 
                    placeholder="Ej. Paciente viene con dolor agudo en el molar 3 hace dos días. Le duele al morder. He visto caries profunda. Procederemos con endodoncia la semana que viene."
                  ></textarea>
                </div>
                
                <button onClick={handleGenerateSummary} disabled={isGeneratingNotes || !aiNotesInput} className="w-full mt-2 py-2 bg-[#5469d4] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#4c5ed1] transition-all disabled:opacity-50 active:scale-95 shadow-md">
                  {isGeneratingNotes ? 'Analizando...' : 'Estructurar Notas'}
                </button>

                {aiNotesResult && (
                  <div className={`mt-4 p-4 border rounded-[6px] transition-colors ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-[#f8fcfb] border-[#a6ebd3]'}`}>
                    <div className={`text-[13px] whitespace-pre-wrap ${isDarkMode ? 'text-blue-200' : 'text-[#1b4d3e]'}`}>{aiNotesResult}</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      );
    }
    if (activeView === 'configuracion') {
      return (
        <div className="px-4 md:px-8 max-w-4xl mx-auto pb-24 mt-8">
          <div className="mb-10">
            <h1 className={`text-[28px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Configuración</h1>
            <p className={`text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Gestiona los detalles de tu clínica y las preferencias del sistema.</p>
          </div>

          <div className="space-y-8">
            {/* General Info */}
            <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <h3 className={`text-[17px] font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                <User className="w-5 h-5 text-[#5469d4]" /> Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Nombre de la Clínica</label>
                  <input 
                    type="text" 
                    value={clinicConfig.name}
                    onChange={(e) => updateClinicConfig({ name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Titular / Director</label>
                  <input 
                    type="text" 
                    value={clinicConfig.owner}
                    onChange={(e) => updateClinicConfig({ owner: e.target.value })}
                    className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Dirección Física</label>
                  <input 
                    type="text" 
                    value={clinicConfig.address}
                    onChange={(e) => updateClinicConfig({ address: e.target.value })}
                    className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Especialidad de la Clínica</label>
                  <select 
                    value={clinicConfig.specialty}
                    onChange={(e) => updateClinicConfig({ specialty: e.target.value })}
                    className={`w-full px-4 py-2 rounded-[6px] border text-[14px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-[#5469d4]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4]'}`}
                  >
                    <option value="Odontología">Odontología (Odontograma)</option>
                    <option value="Fisioterapia">Fisioterapia (Mapa de Dolor)</option>
                    <option value="General">Medicina General / Otros</option>
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">Este ajuste cambiará automáticamente el tipo de ficha médica que verás en cada paciente.</p>
                </div>
              </div>
            </div>

            {/* Horarios de Apertura */}
            <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-[17px] font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                  <Clock className="w-5 h-5 text-[#5469d4]" /> Horarios de Apertura
                </h3>
              </div>
              <div className="space-y-3">
                {clinicConfig.openingHours.map((hour: any, idx: number) => (
                  <div key={hour.day} className="flex flex-wrap items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className={`w-24 text-[14px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>{hour.day}</div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="time" 
                        value={hour.open}
                        disabled={hour.closed}
                        onChange={(e) => {
                          const newHours = [...clinicConfig.openingHours];
                          newHours[idx].open = e.target.value;
                          updateClinicConfig({ openingHours: newHours });
                        }}
                        className={`px-3 py-1.5 rounded-[6px] border text-[13px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white disabled:opacity-30' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#1a1f36] disabled:opacity-40'}`}
                      />
                      <span className="text-gray-400">a</span>
                      <input 
                        type="time" 
                        value={hour.close}
                        disabled={hour.closed}
                        onChange={(e) => {
                          const newHours = [...clinicConfig.openingHours];
                          newHours[idx].close = e.target.value;
                          updateClinicConfig({ openingHours: newHours });
                        }}
                        className={`px-3 py-1.5 rounded-[6px] border text-[13px] outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white disabled:opacity-30' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#1a1f36] disabled:opacity-40'}`}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const newHours = [...clinicConfig.openingHours];
                        newHours[idx].closed = !newHours[idx].closed;
                        updateClinicConfig({ openingHours: newHours });
                      }}
                      className={`ml-auto px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${hour.closed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                    >
                      {hour.closed ? 'CERRADO' : 'ABIERTO'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI & Automation */}
            <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <h3 className={`text-[17px] font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                <Brain className="w-5 h-5 text-[#5469d4]" /> Nexora AI & Automatización
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <div>
                    <div className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Asistente IA Nexora</div>
                    <div className="text-[12px] text-gray-400">Activa el motor de IA para generación de notas y resúmenes.</div>
                  </div>
                  <button 
                    onClick={() => updateClinicConfig({ aiEnabled: !clinicConfig.aiEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${clinicConfig.aiEnabled ? 'bg-[#5469d4]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${clinicConfig.aiEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <div>
                    <div className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Resúmenes Automáticos</div>
                    <div className="text-[12px] text-gray-400">Generar resumen clínico automáticamente al terminar cada cita.</div>
                  </div>
                  <button 
                    onClick={() => updateClinicConfig({ autoSummaries: !clinicConfig.autoSummaries })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${clinicConfig.autoSummaries ? 'bg-[#5469d4]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${clinicConfig.autoSummaries ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Plan & Billing */}
            <div className={`rounded-[12px] border p-8 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <h3 className={`text-[17px] font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                <Package className="w-5 h-5 text-amber-500" /> Plan y Suscripción
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Plan {clinicConfig.plan}</div>
                    <div className="text-[12px] text-gray-400">Tu suscripción se renueva el 15 de Mayo, 2026.</div>
                  </div>
                </div>
                <button 
                  onClick={() => window.alert('Próximamente: Pasarela de cambio de plan.')}
                  className="px-4 py-2 bg-[#5469d4] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all"
                >
                  Mejorar Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeView === 'agenda') {
      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Agenda de Citas</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/book/demo-clinic`;
                  handleCopyLink(url, 'agenda-link');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[4px] font-semibold text-[13px] transition-colors shadow-sm ${copiedStates['agenda-link'] ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400' : isDarkMode ? 'bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:bg-[#f6f9fc]'}`}
              >
                {copiedStates['agenda-link'] ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4 rotate-45" />}
                {copiedStates['agenda-link'] ? '¡Copiado!' : 'Compartir Link Cliente'}
              </button>
              <button 
                onClick={() => setIsAddAppointmentModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus className="w-4 h-4" /> Nueva Cita Int.
              </button>
            </div>
          </div>

          <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
              <Search className="w-4 h-4 text-[#8792a2]" />
              <input type="text" placeholder="Filtrar citas por paciente o servicio..." className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Fecha / Hora</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Paciente</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Servicio</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Estado</th>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-right"></th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Grid className="w-8 h-8 text-[#8792a2] mb-3" />
                          <h3 className={`text-[14px] font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No hay citas todavía</h3>
                          <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Empieza agendando tu primera cita.</p>
                          <button 
                            onClick={() => setIsAddAppointmentModalOpen(true)}
                            className="text-[#5469d4] font-semibold text-[13px] hover:underline dark:text-[#a5b4fc]"
                          >
                            Añadir cita
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt: any) => (
                      <tr key={apt.id} className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className={`text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{apt.date}</span>
                            <span className={`text-[12px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{apt.startTime}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                          {apt.patientName}
                        </td>
                        <td className={`px-4 py-3 text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                          {apt.type}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                            apt.status === 'SCHEDULED' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#e3f2fd] text-[#0d47a1]') : 
                            apt.status === 'COMPLETED' ? (isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-[#e8f5e9] text-[#1b5e20]') : 
                            (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-[#fff3e0] text-[#e65100]')
                          }`}>
                            {apt.status === 'SCHEDULED' ? 'Programada' : apt.status === 'COMPLETED' ? 'Completada' : apt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right relative">
                          <div className="relative action-menu-container flex justify-end">
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `apt-${apt.id}` ? null : `apt-${apt.id}`); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {activeDropdown === `apt-${apt.id}` && (
                              <div className={`absolute right-8 top-0 w-32 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                                <button onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setActiveDropdown(null); 
                                  const dateStr = new Date().toISOString().split('T')[0];
                                  setEditingAppointment({ id: apt.id, patientId: '', durationMinutes: 30, date: dateStr, time: "12:00", status: apt.status }); 
                                  setIsEditAppointmentModalOpen(true); 
                                }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                                  <Pencil className="w-3.5 h-3.5" /> Editar
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeleteAppointment(apt.id); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
                                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className={`px-4 py-3 border-t transition-colors text-[12px] ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-gray-500' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#4f566b]'}`}>
              <span>Mostrando {appointments.length} resultados</span>
            </div>
          </div>

          {/* Edit Appointment Modal */}
          {isEditAppointmentModalOpen && editingAppointment && (
            <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#1a1f36]">Editar cita</h3>
                  <button onClick={() => setIsEditAppointmentModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditAppointmentSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Paciente/Cliente</label>
                      <select 
                        required
                        value={editingAppointment.patientId}
                        onChange={(e) => setEditingAppointment({...editingAppointment, patientId: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      >
                        <option value="" disabled>Selecciona un paciente</option>
                        {patients.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.fullName}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Fecha</label>
                        <input 
                          type="date" 
                          required
                          value={editingAppointment.date}
                          onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
                          className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Hora</label>
                        <input 
                          type="time" 
                          required
                          value={editingAppointment.time}
                          onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                          className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Estado</label>
                      <select
                        value={editingAppointment.status}
                        onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      >
                        <option value="SCHEDULED">Programada</option>
                        <option value="COMPLETED">Completada</option>
                        <option value="CANCELLED">Cancelada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Duración (minutos)</label>
                      <select
                        value={editingAppointment.durationMinutes}
                        onChange={(e) => setEditingAppointment({...editingAppointment, durationMinutes: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={90}>1.5 horas</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsEditAppointmentModalOpen(false)}
                      className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingAppointment}
                      className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingAppointment ? 'Guardando...' : 'Guardar cita'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Appointment Modal */}
          {isAddAppointmentModalOpen && (
            <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#1a1f36]">Nueva cita</h3>
                  <button onClick={() => setIsAddAppointmentModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddAppointmentSubmit} className="p-6">
                  {patients.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-[14px] text-[#4f566b] mb-4">Debes dar de alta a un cliente/paciente antes de poder agendar una cita.</p>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddAppointmentModalOpen(false);
                          setActiveView('pacientes');
                          setIsAddPatientModalOpen(true);
                        }}
                        className="text-[#5469d4] font-semibold text-[13px] hover:underline"
                      >
                        Crear mi primer cliente
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Paciente/Cliente *</label>
                        <select 
                          required
                          value={newAppointmentForm.patientId}
                          onChange={(e) => setNewAppointmentForm({...newAppointmentForm, patientId: e.target.value})}
                          className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        >
                          <option value="" disabled>Selecciona un paciente</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.fullName}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Fecha *</label>
                          <input 
                            type="date" 
                            required
                            value={newAppointmentForm.date}
                            onChange={(e) => setNewAppointmentForm({...newAppointmentForm, date: e.target.value})}
                            className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Hora (24h) *</label>
                          <input 
                            type="time" 
                            required
                            value={newAppointmentForm.time}
                            onChange={(e) => setNewAppointmentForm({...newAppointmentForm, time: e.target.value})}
                            className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Duración (minutos)</label>
                        <select
                          value={newAppointmentForm.durationMinutes}
                          onChange={(e) => setNewAppointmentForm({...newAppointmentForm, durationMinutes: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        >
                          <option value={15}>15 minutos</option>
                          <option value={30}>30 minutos</option>
                          <option value={45}>45 minutos</option>
                          <option value={60}>1 hora</option>
                          <option value={90}>1.5 horas</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsAddAppointmentModalOpen(false)}
                      className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                    >
                      Cancelar
                    </button>
                    {patients.length > 0 && (
                      <button 
                        type="submit" 
                        disabled={isSubmittingAppointment}
                        className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                      >
                        {isSubmittingAppointment ? 'Guardando...' : 'Confirmar Cita'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Specialized Views check
    const specializedView = currentSpecialtyConfig.specializedItems.find(item => item.id === activeView);
    if (specializedView) {
      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-[24px] font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                {specializedView.label} 
              </h1>
              <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Módulo especializado para {clinicConfig.specialty}.</p>
            </div>
          </div>
          
          <div className={`rounded-xl border shadow-sm overflow-hidden min-h-[500px] ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
             {activeView === 'odontograma' && <Odontogram isDarkMode={isDarkMode} value={patientRecord.odontogram} onChange={(v) => setPatientRecord(prev => ({...prev, odontogram: v}))} />}
             {activeView === 'dietas' && <NutritionPlan isDarkMode={isDarkMode} value={patientRecord.nutritionPlan} onChange={(v) => setPatientRecord(prev => ({...prev, nutritionPlan: v}))} />}
             {activeView === 'mapa_dolor' && <PainMap isDarkMode={isDarkMode} value={patientRecord.painPoints} onChange={(v) => setPatientRecord(prev => ({...prev, painPoints: v}))} />}
             {activeView === 'sesiones' && <SessionDiary isDarkMode={isDarkMode} value={patientRecord.psychSessions} onChange={(v) => setPatientRecord(prev => ({...prev, psychSessions: v}))} />}
             {activeView === 'galeria' && <AestheticGal isDarkMode={isDarkMode} value={patientRecord.aestheticPhotos} onChange={(v) => setPatientRecord(prev => ({...prev, aestheticPhotos: v}))} />}
             
             {['presupuestos', 'evolucion', 'ejercicios', 'test', 'stock_estetica'].includes(activeView) && (
                <div className={`p-20 text-center flex flex-col items-center gap-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
                      {specializedView.icon}
                   </div>
                   <div>
                      <h4 className="font-bold text-lg">{specializedView.label}</h4>
                      <p className="text-sm text-gray-500 max-w-sm mt-1">Este módulo avanzado permite gestionar {specializedView.label.toLowerCase()} de forma optimizada para {clinicConfig.specialty}.</p>
                   </div>
                   <button className="mt-4 px-6 py-2 bg-[#5469d4] text-white rounded-lg text-sm font-bold shadow-md">
                      Configurar {specializedView.label}
                   </button>
                </div>
             )}
          </div>
        </div>
      );
    }

    if (activeView === 'pacientes') {
      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Clientes / Pacientes</h1>
            <button 
              onClick={() => setIsAddPatientModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" /> Añadir
            </button>
          </div>

          <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
              <Search className="w-4 h-4 text-[#8792a2]" />
              <input type="text" placeholder="Filtrar clientes por nombre..." className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Nombre Completo</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Contacto</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Etiquetas</th>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-right"></th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-8 h-8 text-[#8792a2] mb-3" />
                          <h3 className={`text-[14px] font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No hay clientes todavía</h3>
                          <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Empieza añadiendo tu primer paciente.</p>
                          <button 
                            onClick={() => setIsAddPatientModalOpen(true)}
                            className="text-[#5469d4] font-semibold text-[13px] hover:underline dark:text-[#a5b4fc]"
                          >
                            Añadir cliente
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr 
                        key={patient.id} 
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setActiveView('historial_clinico');
                        }}
                        className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${isDarkMode ? 'bg-[#0f172a] text-gray-300' : 'bg-[#e3e8ee] text-[#1a1f36]'}`}>
                              {patient.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{patient.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`flex flex-col text-[12px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                            {patient.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {patient.email}</span>}
                            {patient.phone ? <span className="flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" /> {patient.phone}</span> : null}
                            {!patient.email && !patient.phone && <span className="text-[#8792a2]">Sin contacto</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {patient.tags && patient.tags !== '[]' ? (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#e3e8ee] text-[#4f566b]'}`}>
                              NUEVO
                            </span>
                          ) : <span className="text-[12px] text-[#8792a2]">-</span>}
                        </td>
                        <td className="px-4 py-3 text-right relative">
                          <div className="relative action-menu-container flex justify-end">
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `patient-${patient.id}` ? null : `patient-${patient.id}`); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {activeDropdown === `patient-${patient.id}` && (
                              <div className={`absolute right-8 top-0 w-32 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleGeneratePortalLink(patient.id); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${copiedStates['portal-'+patient.id] ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30 hover:opacity-80' : isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                                  {copiedStates[`portal-${patient.id}`] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />} {copiedStates[`portal-${patient.id}`] ? 'Copiado!' : 'Enlace Paciente'}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setEditingPatient(patient); setIsEditPatientModalOpen(true); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                                  <Pencil className="w-3.5 h-3.5" /> Editar
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeletePatient(patient.id); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
                                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className={`px-4 py-3 border-t transition-colors text-[12px] ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-gray-500' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#4f566b]'}`}>
              <span>Mostrando {patients.length} resultados</span>
            </div>
          </div>

          {/* Edit Patient Modal */}
          {isEditPatientModalOpen && editingPatient && (
            <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#1a1f36]">Editar cliente</h3>
                  <button onClick={() => { setIsEditPatientModalOpen(false); setEditingPatient(null); }} className="text-[#8792a2] hover:text-[#1a1f36]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditPatientSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Nombre completo *</label>
                      <input 
                        type="text" 
                        required
                        value={editingPatient.fullName}
                        onChange={(e) => setEditingPatient({...editingPatient, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Correo electrónico</label>
                      <input 
                        type="email" 
                        value={editingPatient.email}
                        onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Teléfono</label>
                      <input 
                        type="tel" 
                        value={editingPatient.phone || ''}
                        onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => { setIsEditPatientModalOpen(false); setEditingPatient(null); }}
                      className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingPatient}
                      className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingPatient ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Patient Modal */}
          {isAddPatientModalOpen && (
            <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#1a1f36]">Añadir cliente / paciente</h3>
                  <button onClick={() => setIsAddPatientModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddPatientSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Nombre completo *</label>
                      <input 
                        type="text" 
                        required
                        value={newPatientForm.fullName}
                        onChange={(e) => setNewPatientForm({...newPatientForm, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        placeholder="Ej. Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Correo electrónico</label>
                      <input 
                        type="email" 
                        value={newPatientForm.email}
                        onChange={(e) => setNewPatientForm({...newPatientForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        placeholder="Ej. jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Teléfono</label>
                      <input 
                        type="tel" 
                        value={newPatientForm.phone}
                        onChange={(e) => setNewPatientForm({...newPatientForm, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        placeholder="+34 600..."
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsAddPatientModalOpen(false)}
                      className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingPatient}
                      className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingPatient ? 'Guardando...' : 'Guardar cliente'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (activeView === 'tratamientos') {
      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-[24px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Servicios / Tratamientos</h1>
            <button 
              onClick={() => setIsAddServiceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" /> Añadir Servicio
            </button>
          </div>

          <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
              <Search className="w-4 h-4 text-[#8792a2]" />
              <input type="text" placeholder="Buscar por nombre de servicio..." className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Servicio</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Categoría</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Duración</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Precio</th>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
                  {localServices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="w-8 h-8 text-[#8792a2] mb-3" />
                          <h3 className={`text-[14px] font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>No hay servicios todavía</h3>
                          <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Empieza añadiendo tu primer servicio / tratamiento.</p>
                          <button 
                            onClick={() => setIsAddServiceModalOpen(true)}
                            className="text-[#5469d4] font-semibold text-[13px] hover:underline"
                          >
                            Añadir servicio
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    localServices.map((service) => (
                      <tr key={service.id} className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                        <td className="px-4 py-3">
                          <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{service.name}</span>
                          {service.description && <div className={`text-[12px] mt-0.5 truncate max-w-[250px] transition-colors ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>{service.description}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-[#e3e8ee] text-[#4f566b]'}`}>{service.category || 'General'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[13px] transition-colors ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{service.duration} min</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[13px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{service.price === 0 ? 'Gratis' : formatCurrency(service.price)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative action-menu-container flex justify-end">
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === service.id ? null : service.id); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {activeDropdown === service.id && (
                              <div className={`absolute right-8 top-0 w-32 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setEditingService(service); setIsEditServiceModalOpen(true); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                                  <Pencil className="w-3.5 h-3.5" /> Editar
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeleteService(service.id); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
                                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className={`px-4 py-3 border-t transition-colors text-[12px] ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-gray-500' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#4f566b]'}`}>
              <span>Mostrando {localServices.length} resultados</span>
            </div>
          </div>

          {/* Edit Service Modal */}
          {isEditServiceModalOpen && editingService && (
            <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#1a1f36]">Editar servicio / tratamiento</h3>
                  <button onClick={() => setIsEditServiceModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditServiceSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Nombre del servicio *</label>
                      <input 
                        type="text" 
                        required
                        value={editingService.name}
                        onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Descripción</label>
                      <input 
                        type="text"
                        value={editingService.description}
                        onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Categoría</label>
                      <input 
                        type="text"
                        value={editingService.category}
                        onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Duración (minutos)</label>
                        <input 
                          type="number"
                          required
                          value={editingService.duration}
                          onChange={(e) => setEditingService({...editingService, duration: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Precio (€)</label>
                        <input 
                          type="number" 
                          required
                          value={editingService.price}
                          onChange={(e) => setEditingService({...editingService, price: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsEditServiceModalOpen(false)}
                      className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Service Modal */}
          {isAddServiceModalOpen && (
            <div className="fixed inset-0 bg-[#1a1f36]/40 z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#1a1f36]">Añadir nuevo servicio</h3>
                  <button onClick={() => setIsAddServiceModalOpen(false)} className="text-[#8792a2] hover:text-[#1a1f36]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddServiceSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Nombre del servicio *</label>
                      <input 
                        type="text" 
                        required
                        value={newServiceForm.name}
                        onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Descripción</label>
                      <input 
                        type="text"
                        value={newServiceForm.description}
                        onChange={(e) => setNewServiceForm({...newServiceForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Categoría</label>
                      <input 
                        type="text"
                        value={newServiceForm.category}
                        onChange={(e) => setNewServiceForm({...newServiceForm, category: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Duración (minutos)</label>
                        <input 
                          type="number"
                          required
                          value={newServiceForm.duration}
                          onChange={(e) => setNewServiceForm({...newServiceForm, duration: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#1a1f36] mb-1.5">Precio (€)</label>
                        <input 
                          type="number" 
                          required
                          value={newServiceForm.price}
                          onChange={(e) => setNewServiceForm({...newServiceForm, price: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-[#e3e8ee] rounded-[4px] text-[13px] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4] outline-none shadow-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsAddServiceModalOpen(false)}
                      className="px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-[#5469d4] text-white rounded-[4px] font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
                    >
                      Guardar servicio
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (activeView === 'facturación') {
      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-[24px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Facturación</h1>
            <div className="flex gap-2">
              <button 
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[4px] font-bold text-[13px] transition-colors shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:bg-[#f6f9fc]'}`}
              >
                <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`} /> Exportar
              </button>
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus className="w-4 h-4" /> Nueva Factura
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Ingresos brutos (Mes)</div>
              <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            </div>
            <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Pagos completados</div>
              <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>24</div>
            </div>
            <div className={`border rounded-[8px] p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <div className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Pagos pendientes</div>
              <div className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>2</div>
            </div>
          </div>

          <div className={`border rounded-[8px] overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className={`flex items-center gap-3 px-4 py-3 border-b relative text-[13px] font-medium transition-colors focus-within:border-[#5469d4] focus-within:ring-1 focus-within:ring-[#5469d4] ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
              <Search className="w-4 h-4 text-[#8792a2]" />
              <input type="text" placeholder="Buscar por cliente, nº factura o importe..." className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b transition-colors ${isDarkMode ? 'border-[#334155] bg-[#0f172a]' : 'border-[#e3e8ee] bg-white'}`}>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Fecha / Factura</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Cliente</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Importe</th>
                    <th className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#1a1f36]'}`}>Estado</th>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#334155]' : 'divide-[#e3e8ee]'}`}>
                  <tr className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>22 Abr 2026</span>
                      <div className={`text-[12px] mt-0.5 uppercase tracking-wide font-mono transition-colors ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>#FV-2026-031</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-[#1b5e20]/10 text-[#1b5e20]'}`}>MR</div>
                        <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>María Rodríguez</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[13px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(60)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-[#e8f5e9] text-[#1b5e20]'}`}>
                        <CheckCircle2 className="w-3 h-3" /> Pagado
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <div className="relative action-menu-container flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `inv-1` ? null : `inv-1`); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeDropdown === `inv-1` && (
                          <div className={`absolute right-8 top-0 w-40 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDownloadInvoicePDF({ date: '22 Abr 2026', number: 'FV-2026-031', client: 'María Rodríguez', amount: formatCurrency(60) }); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                              <Download className="w-3.5 h-3.5" /> Descargar PDF
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
                              <Trash2 className="w-3.5 h-3.5" /> Anular factura
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  <tr className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`}>
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>21 Abr 2026</span>
                      <div className={`text-[12px] mt-0.5 uppercase tracking-wide font-mono transition-colors ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>#FV-2026-030</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-[#0d47a1]/10 text-[#0d47a1]'}`}>JG</div>
                        <span className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Juán Gómez</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[13px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(250)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-colors ${isDarkMode ? 'bg-orange-900/40 text-orange-400' : 'bg-[#fff3e0] text-[#e65100]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-orange-400' : 'bg-[#e65100]'}`}></span> Pendiente
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <div className="relative action-menu-container flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `inv-2` ? null : `inv-2`); }} className={`p-1.5 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-[#8792a2] hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeDropdown === `inv-2` && (
                          <div className={`absolute right-8 top-0 w-40 border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                             <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-green-400 hover:bg-[#334155]' : 'text-[#1b5e20] hover:bg-[#f6f9fc]'}`}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Marcar Pagada
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDownloadInvoicePDF({ date: '21 Abr 2026', number: 'FV-2026-030', client: 'Juán Gómez', amount: formatCurrency(250) }); }} className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#334155]' : 'text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                              <Download className="w-3.5 h-3.5" /> Descargar PDF
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} className={`w-full text-left px-3 py-1.5 text-[13px] text-[#e53935] flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}>
                              <Trash2 className="w-3.5 h-3.5" /> Anular factura
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className={`px-4 py-3 border-t transition-colors text-[12px] ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-gray-500' : 'bg-[#f6f9fc] border-[#e3e8ee] text-[#4f566b]'}`}>
              <span>Mostrando 2 facturas recientes</span>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeView === 'análisis') {
      const revenueData = [
        { name: 'Ene', ingresos: 4200, gastos: 2800 },
        { name: 'Feb', ingresos: 4800, gastos: 2900 },
        { name: 'Mar', ingresos: 5100, gastos: 3100 },
        { name: 'Abr', ingresos: stats?.monthlyRevenue || 4500, gastos: 3200 },
      ];

      const serviceData = [
        { name: 'Limpieza', value: 45 },
        { name: 'Blanqueamiento', value: 25 },
        { name: 'Ortodoncia', value: 20 },
        { name: 'Otros', value: 10 },
      ];

      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Análisis de Negocio</h1>
              <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Rendimiento financiero y operativo de tu clínica.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[4px] font-semibold text-[13px] transition-colors shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:bg-[#f6f9fc]'}`}>
                <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`} /> Informe Mensual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className={`rounded-[8px] p-6 border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155] shadow-lg shadow-black/20' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
              <h3 className={`text-[15px] font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Ingresos vs Gastos</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f0f0f0'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8792a2'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8792a2'}} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: isDarkMode ? '1px solid #334155' : '1px solid #e3e8ee', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        color: isDarkMode ? '#fff' : '#1a1f36'
                      }}
                      itemStyle={{ fontSize: '13px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#8792a2' }} />
                    <Bar dataKey="ingresos" fill="#5469d4" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="gastos" fill="#80e9ff" radius={[4, 4, 0, 0]} barSize={24} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`rounded-[8px] p-6 border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155] shadow-lg shadow-black/20' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
              <h3 className={`text-[15px] font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Distribución por Servicio</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#5469d4', '#80e9ff', '#7a32fc', isDarkMode ? '#334155' : '#e3e8ee'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: isDarkMode ? '1px solid #334155' : '1px solid #e3e8ee', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        color: isDarkMode ? '#fff' : '#1a1f36'
                      }}
                      itemStyle={{ fontSize: '13px' }}
                    />
                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Tasa de Conversión', value: '68%', trend: '+4%', color: 'text-green-500' },
              { label: 'Ticket Medio', value: '142€', trend: '+12€', color: 'text-green-500' },
              { label: 'Nuevos Pacientes (Mes)', value: '18', trend: '-2', color: 'text-red-500' }
            ].map((stat, i) => (
              <div key={i} className={`rounded-[8px] p-5 border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155] shadow-lg shadow-black/10' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
                <div className={`text-[13px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{stat.label}</div>
                <div className="flex items-end justify-between">
                  <div className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stat.value}</div>
                  <div className={`text-[12px] font-bold ${stat.color}`}>{stat.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeView === 'insights') {
      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="mb-8">
            <h1 className={`text-[24px] font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
              <span className={`w-8 h-8 rounded-[4px] flex items-center justify-center transition-colors ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#f0f4ff] text-[#5469d4]'}`}>
                <BarChart className="w-5 h-5" />
              </span>
              Insights Avanzados
            </h1>
            <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Análisis predictivo de Nexora AI sobre tu base de datos.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            
            {/* AI Recommendation Card */}
            <div className={`rounded-[12px] p-6 relative overflow-hidden transition-all border ${isDarkMode ? 'bg-[#1e293b] border-blue-500/50 shadow-xl shadow-blue-500/10' : 'bg-[#fcfdff] border-[#5469d4]/30 shadow-sm'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <HelpCircle className={`w-32 h-32 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </div>
              <div className="relative z-10">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 shadow-sm ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-[#5469d4] text-white'}`}>
                  <Bell className="w-3 h-3" /> Prioridad Alta
                </div>
                <h3 className={`text-[20px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Optimización de Agenda Predictiva</h3>
                <p className={`text-[14px] max-w-2xl mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>
                  Nexora ha detectado que los martes de 10:00 a 12:00 tienen una tasa de cancelación un 35% superior a la media. 
                  Sugerimos implementar recordatorios automáticos de WhatsApp 4 horas antes para este intervalo.
                </p>
                <div className="flex gap-3">
                  <button className="px-5 py-2 bg-[#5469d4] text-white rounded-[4px] font-bold text-[13px] hover:bg-[#4c5ed1] transition-all shadow-md active:scale-95">
                    Aplicar Automáticamente
                  </button>
                  <button className={`px-5 py-2 rounded-[4px] font-bold text-[13px] transition-all border ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white hover:bg-[#1e293b]' : 'bg-white border-[#e3e8ee] text-[#4f566b] hover:bg-[#f6f9fc]'}`}>
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Insight 1 */}
              <div className={`rounded-[8px] p-6 border transition-all ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Potencial de Fidelización</h4>
                </div>
                <p className={`text-[13px] leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                  Hay 24 clientes que no han tenido una revisión en los últimos 12 meses. Tu "Lifetime Value" proyectado podría aumentar un 14% si recuperas al menos el 20% de ellos.
                </p>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-[#f6f9fc]'}`}>
                  <div className="bg-green-500 h-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-[11px] font-medium text-[#8792a2]">
                  <span>Retención Actual: 65%</span>
                  <span>Objetivo AI: 80%</span>
                </div>
              </div>

              {/* Insight 2 */}
              <div className={`rounded-[8px] p-6 border transition-all ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee] shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <h4 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Tendencias de Tratamiento</h4>
                </div>
                <p className={`text-[13px] leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                  La demanda de Blanqueamiento Dental ha crecido un 42% en el último trimestre. Considera crear un pack de "Higiene + Blanqueamiento" para maximizar ingresos.
                </p>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-[11px] font-semibold rounded-[4px] ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>Estética</span>
                  <span className={`px-2 py-1 text-[11px] font-semibold rounded-[4px] ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>Alta demanda</span>
                </div>
              </div>
            </div>

            {/* AI Assistant Chat Context */}
            <div className={`rounded-[8px] p-6 shadow-lg transition-colors ${isDarkMode ? 'bg-[#0f172a] shadow-black/40 border border-blue-500/20' : 'bg-[#1a1f36]'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5469d4] flex items-center justify-center font-bold text-[12px] text-white">NX</div>
                  <div>
                    <h4 className="text-[15px] font-bold text-white">Nexora AI Chat</h4>
                    <span className="text-[11px] text-[#8792a2]">Consultoría de Negocio 24/7</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-[#2d334d] p-3 rounded-[8px] text-[13px] max-w-[80%] border-l-4 border-[#5469d4] text-white">
                  ¿Cómo puedo ayudarte a mejorar la rentabilidad de Nexora Clinic hoy?
                </div>
                <div className="bg-[#5469d4] p-3 rounded-[8px] text-[13px] max-w-[80%] ml-auto text-right text-white">
                  Muéstrame los pacientes con mayor riesgo de abandono.
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Pregunta a la IA..." 
                  className={`flex-1 border-none outline-none px-4 py-2 rounded-[4px] text-[13px] placeholder:text-[#8792a2] transition-colors ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-[#2d334d] text-white'}`}
                />
                <button className="p-2 bg-[#5469d4] rounded-[4px] hover:bg-[#4c5ed1] transition-colors">
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

          </div>
        </div>
      );
    }
    
    if (activeView === 'staff') {
      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-[24px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Personal y Turnos</h1>
              <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Gestiona la disponibilidad, vacaciones y asignación de salas de tu equipo médico.</p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className={`flex items-center border-b mb-6 transition-colors ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
            <button 
              onClick={() => setActiveStaffTab('cuadrante')}
              className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors ${activeStaffTab === 'cuadrante' ? (isDarkMode ? 'border-blue-400 text-white' : 'border-[#5469d4] text-[#5469d4]') : (isDarkMode ? 'border-transparent text-gray-500 hover:text-gray-300' : 'border-transparent text-[#8792a2] hover:text-[#4f566b]')}`}
            >
              Cuadrante Semanal
            </button>
            <button 
              onClick={() => setActiveStaffTab('salas')}
              className={`px-4 py-2 text-[14px] font-semibold border-b-2 transition-colors ${activeStaffTab === 'salas' ? (isDarkMode ? 'border-blue-400 text-white' : 'border-[#5469d4] text-[#5469d4]') : (isDarkMode ? 'border-transparent text-gray-500 hover:text-gray-300' : 'border-transparent text-[#8792a2] hover:text-[#4f566b]')}`}
            >
              Equipos y Salas
            </button>
          </div>

          <div className={`p-6 rounded-[8px] border shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            
            {activeStaffTab === 'cuadrante' && (
              <>
                <h3 className={`text-[16px] font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Planificación de {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                
                {/* Shifts Logic Iteration */}
                <div className="space-y-4">
                  {users.map(user => {
                    const userShifts = shifts.filter(s => s.userId === user.id);
                    return (
                      <div key={user.id} className={`flex flex-col md:flex-row p-4 rounded-[6px] border ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
                        <div className="w-full md:w-1/4 mb-4 md:mb-0">
                          <div className="flex gap-3 items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-[#1e293b] text-blue-400' : 'bg-white text-[#5469d4]'}`}>
                              {user.name.charAt(0)}{user.name.split(' ').length > 1 ? user.name.split(' ')[1].charAt(0) : ''}
                            </div>
                            <div>
                              <p className={`font-bold text-[14px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                              <p className={`text-[11px] font-medium uppercase mt-0.5 ${user.role === 'DOCTOR' ? 'text-[#8792a2]' : 'text-purple-500'}`}>{user.role}</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-full md:w-3/4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Let's render the upcoming shifts or vacations */}
                          {userShifts.length === 0 ? (
                            <div className="col-span-full flex items-center text-[12px] text-gray-500 italic">
                              Sin turnos asignados esta semana
                            </div>
                          ) : (
                            userShifts.map((shift, idx) => {
                               const shiftDate = new Date(shift.startTime);
                               const formattedDate = `${String(shiftDate.getDate()).padStart(2, '0')}/${String(shiftDate.getMonth() + 1).padStart(2, '0')}`;
                               return (
                                 <div key={idx} className={`p-3 border-l-4 rounded-r-[4px] shadow-sm ${shift.type === 'VACATION' ? (isDarkMode ? 'border-orange-500 bg-orange-900/20' : 'border-[#e65100] bg-[#fff3e0]') : (isDarkMode ? 'border-blue-500 bg-[#1e293b]' : 'border-[#5469d4] bg-white')}`}>
                                   <p className={`text-[11px] font-bold uppercase mb-1 ${shift.type === 'VACATION' ? 'text-orange-500' : (isDarkMode ? 'text-blue-400' : 'text-[#5469d4]')}`}>
                                     {shift.type === 'VACATION' ? 'Vacaciones' : 'Turno Trabajo'}
                                   </p>
                                   <p className={`text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                     {formattedDate}
                                   </p>
                                   <div className={`text-[11px] mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                     <Clock className="w-3 h-3"/> 
                                     {new Date(shift.startTime).getHours()}:{new Date(shift.startTime).getMinutes().toString().padStart(2, '0')} - {new Date(shift.endTime).getHours()}:{new Date(shift.endTime).getMinutes().toString().padStart(2, '0')}
                                   </div>
                                   {shift.roomId && (
                                     <div className={`text-[10px] mt-1.5 inline-block px-1.5 py-0.5 rounded-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                       {rooms.find(r => r.id === shift.roomId)?.name || 'Sala'}
                                     </div>
                                   )}
                                 </div>
                               );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setIsAddShiftModalOpen(true)} className="px-4 py-2 bg-[#5469d4] hover:bg-[#4c5ed1] text-white rounded-[4px] text-[13px] font-bold flex items-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Asignar Turno
                  </button>
                </div>
              </>
            )}

            {activeStaffTab === 'salas' && (
              <>
                 <div className="flex items-center justify-between mb-4">
                   <h3 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Gestión de Espacios y Consultas</h3>
                   <button onClick={() => setIsAddRoomModalOpen(true)} className="px-4 py-2 border border-[#5469d4] text-[#5469d4] hover:bg-[#5469d4] hover:text-white rounded-[4px] text-[13px] font-bold flex items-center gap-2 transition-all">
                      <Plus className="w-4 h-4" /> Añadir Sala
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                   {rooms.length === 0 ? (
                     <div className="col-span-full py-8 text-center text-[13px] text-gray-500 italic">No hay salas configuradas.</div>
                   ) : rooms.map(room => (
                     <div key={room.id} className={`p-5 rounded-[8px] border transition-colors relative group ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#fcfdff] border-[#e3e8ee] hover:border-[#5469d4]'}`}>
                       
                       {/* Floating actions */}
                       <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setEditingRoom(room);
                             setIsEditRoomModalOpen(true);
                           }} 
                           className={`p-1.5 rounded-[4px] transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#8792a2] hover:text-[#5469d4] hover:bg-[#e3e8ee]'}`}
                         >
                           <Pencil className="w-3.5 h-3.5" />
                         </button>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteRoom(room.id);
                           }} 
                           className={`p-1.5 rounded-[4px] text-red-500 transition-colors ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-[#ffebee]'}`}
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       </div>

                       <div className="flex items-start justify-between mb-4">
                         <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a] text-blue-400' : 'bg-[#f0f4f8] text-[#5469d4]'}`}>
                            <Grid className="w-6 h-6" />
                         </div>
                         <span className={`px-2 py-1 text-[11px] font-bold rounded-full mr-12 ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>Activa</span>
                       </div>
                       <h4 className={`text-[16px] font-bold mb-1 pr-6 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{room.name}</h4>
                       <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#8792a2]'}`}>ID Interno: {room.id.split('-')[0]}</p>
                     </div>
                   ))}
                 </div>
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeView === 'automatizaciones') {
      return (
        <div className="px-4 md:px-8 max-w-6xl mxauto pb-24 mt-8 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-[24px] font-bold tracking-tight mb-2 flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                <HelpCircle className="w-6 h-6 text-[#5469d4]" /> Automatizaciones Inteligentes
              </h1>
              <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Configura tus flujos automáticos potenciados por Inteligencia Nexora.</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] text-white rounded-[4px] font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm">
              <Plus className="w-4 h-4" /> Nueva automatización
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className={`p-6 rounded-[8px] border relative transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#fcfdff] border-[#e3e8ee]'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a] text-green-400' : 'bg-[#f0f4f8] text-[#008477]'}`}>
                   <Bell className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-[11px] font-bold rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>Activa</span>
                  <div className={`w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${isDarkMode ? 'bg-green-500' : 'bg-[#008477]'}`}>
                    <div className="w-3 h-3 rounded-full bg-white transform translate-x-4 shadow-sm"></div>
                  </div>
                </div>
              </div>
              <h4 className={`text-[16px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Recordatorios de Citas por WhatsApp</h4>
              <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#8792a2]'}`}>Envía un mensaje inteligente 24 horas antes a los pacientes para reducir inasistencias.</p>
              
              <div className={`flex items-center justify-between pt-4 border-t text-[12px] ${isDarkMode ? 'border-[#334155] text-gray-400' : 'border-[#e3e8ee] text-[#4f566b]'}`}>
                <span>45 mensajes enviados hoy</span>
                <button className="font-medium text-[#5469d4] hover:underline">Configurar</button>
              </div>
            </div>

            <div className={`p-6 rounded-[8px] border relative transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#fcfdff] border-[#e3e8ee]'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a] text-blue-400' : 'bg-[#f0f4f8] text-[#5469d4]'}`}>
                   <Grid className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-[11px] font-bold rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>Pausado</span>
                   <div className={`w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
                  </div>
                </div>
              </div>
              <h4 className={`text-[16px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Alerta de Solapamiento</h4>
              <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#8792a2]'}`}>El sistema revisa constantemente el cuadrante y te notifica si hay agendas superpuestas.</p>
              
              <div className={`flex items-center justify-between pt-4 border-t text-[12px] ${isDarkMode ? 'border-[#334155] text-gray-400' : 'border-[#e3e8ee] text-[#4f566b]'}`}>
                <span>0 alertas activas</span>
                <button className="font-medium text-[#5469d4] hover:underline">Configurar</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeView === 'insights') {
      return (
         <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-[24px] font-bold tracking-tight mb-2 flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                <BarChart className="w-6 h-6 text-amber-500" /> Insights Avanzados
              </h1>
              <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Análisis predictivos sobre el rendimiento de tu clínica.</p>
            </div>
            <div className={`flex items-center gap-2 text-[12px] font-medium px-3 py-1.5 rounded-full border ${isDarkMode ? 'bg-amber-900/20 text-amber-500 border-amber-900/50' : 'bg-[#fffbeb] text-amber-700 border-amber-200'}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Analizando en tiempo real
            </div>
          </div>

          <div className={`border rounded-[8px] p-6 mb-8 transition-colors shadow-sm ${isDarkMode ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-[#334155]' : 'bg-gradient-to-br from-white to-[#fcfdff] border-[#e3e8ee]'}`}>
            <h3 className={`text-[15px] font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
              <BarChart className="w-4 h-4 text-purple-500" /> Resumen Predictivo
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-[6px] border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-[#f6f9fc] border-transparent'}`}>
                <p className={`text-[13px] ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>
                  <strong className={isDarkMode ? 'text-white' : 'text-[#1a1f36]'}>Reducción de Inasistencias:</strong> La activación de recordatorios automáticos ha disminuido los No-Shows en un estimado del <span className="text-green-500 font-bold">12%</span> respecto al mes pasado.
                </p>
              </div>
              <div className={`p-4 rounded-[6px] border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-[#f6f9fc] border-transparent'}`}>
                 <p className={`text-[13px] ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>
                  <strong className={isDarkMode ? 'text-white' : 'text-[#1a1f36]'}>Optimización de Salas:</strong> La <span className="italic">Consulta 2</span> tiene una tasa de ocupación del <span className="text-orange-500 font-bold">85%</span>. Se recomienda redistribuir turnos no prioritarios hacia la <span className="italic">Consulta 1</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeView === 'telemedicina') {
      if (activeTelemedicineCall) {
        return (
          <div className="h-full w-full p-4 animate-in fade-in zoom-in-95 duration-300 relative bg-black">
            <TelemedicineRoom 
              isDarkMode={isDarkMode} 
              appointmentInfo={activeTelemedicineCall}
              onEndCall={() => setActiveTelemedicineCall(null)} 
            />
          </div>
        );
      }

      return (
        <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24 mt-8 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-[24px] font-bold tracking-tight mb-2 flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                <Video className="w-6 h-6 text-[#5469d4]" /> Videoconsultas
              </h1>
              <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>Gestiona y accede a tus citas de telemedicina cifradas de extremo a extremo.</p>
            </div>
            {/* Start direct room */}
            <button 
              onClick={() => setActiveTelemedicineCall({ patientName: 'Paciente (Invitado)' })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-[4px] font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
            >
              <PhoneCall className="w-4 h-4" /> Iniciar sesión urgente
            </button>
          </div>

          <div className="space-y-4">
            <h3 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Citas Online Programadas (Hoy)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.filter(a => a.status === 'scheduled').slice(0, 3).map((app, idx) => (
                 <div key={idx} className={`p-5 rounded-[8px] border transition-colors flex flex-col justify-between ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#fcfdff] border-[#e3e8ee]'}`}>
                    <div>
                       <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            E2E Secure Video
                          </span>
                          <div className="flex items-center gap-1 text-[12px] text-gray-500">
                             <Clock className="w-3.5 h-3.5" />
                             {app.time}
                          </div>
                       </div>
                       <h4 className={`text-[16px] font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Consulta con Paciente ID: {app.patientId.slice(0,8)}</h4>
                       <p className={`text-[13px] mb-4 ${isDarkMode ? 'text-gray-400' : 'text-[#8792a2]'}`}>{app.notes || 'Revisión general online.'}</p>
                    </div>
                    
                    <button 
                      onClick={() => setActiveTelemedicineCall({ patientName: 'Paciente ID: ' + app.patientId.slice(0,8), time: app.time })}
                      className="w-full py-2.5 bg-[#5469d4] hover:bg-[#4c5ed1] text-white text-[13px] font-bold rounded-[6px] transition-colors flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" /> Unirse a la sala
                    </button>
                 </div>
              ))}

              {/* Empty placeholder if no upcoming */}
              {appointments.filter(a => a.status === 'scheduled').length === 0 && (
                 <div className="col-span-full py-16 text-center text-[13px] text-gray-500">
                    No hay citas online programadas para hoy.
                 </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="px-4 md:px-8 max-w-6xl mx-auto pb-24">
        {/* HOY Section */}
        <div className="mt-4 mb-10">
          <h1 className={`text-[28px] font-bold tracking-tight mb-8 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Hoy</h1>
          
          {reactivationCandidates.length > 0 && (
            <div className={`mb-8 p-4 border rounded-[8px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-800/50' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center mt-0.5 ${isDarkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-[#5469d4]'}`}>
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-[15px] font-bold ${isDarkMode ? 'text-blue-100' : 'text-[#1a1f36]'}`}>Sugerencia de Contexto Inteligente</h4>
                  <p className={`text-[13px] mt-0.5 ${isDarkMode ? 'text-blue-200' : 'text-[#4f566b]'}`}>
                    Hemos detectado que <strong>{reactivationCandidates[0].fullName}</strong> no viene desde hace más de 6 meses. ¿Quieres enviarle un mensaje de reactivación?
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAiDraftInput({
                    patientName: reactivationCandidates[0].fullName,
                    appointmentType: 'Revisión General',
                    time: 'Pronto',
                    goal: 'reactivation'
                  });
                  setActiveView('nexora_ai');
                  setTimeout(() => {
                    window.scrollTo({ top: document.getElementById('ai-whatsapp-tool')?.offsetTop! - 100, behavior: 'smooth' });
                  }, 100);
                }}
                className={`shrink-0 px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-[#5469d4] text-white hover:bg-[#4c5ed1]'}`}
              >
                Cargar en Generador
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {/* Left Col */}
            <div className={`flex flex-col border-b pb-4 mb-4 md:border-b-0 md:pb-0 md:mb-0 transition-colors ${isDarkMode ? 'border-gray-800' : 'border-[#e3e8ee]'}`}>
              <div className="flex items-start gap-12">
                <div ref={periodMenuRef} className="relative">
                  <button 
                    onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                    className={`flex items-center gap-1 text-[13px] font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-[#425466] hover:text-[#1a1f36]'}`}
                  >
                    Ingresos ({activePeriod}) <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPeriodMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isPeriodMenuOpen && (
                    <div className={`absolute top-full left-0 mt-1 w-32 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                      {['Diario', 'Semanal', 'Mensual', 'Anual'].map(p => (
                        <button key={p} onClick={() => { setActivePeriod(p); setIsPeriodMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className={`text-[20px] font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                  <div className={`text-[12px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>{new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div ref={patientsMenuRef} className="relative">
                  <button 
                    onClick={() => setIsPatientsMenuOpen(!isPatientsMenuOpen)}
                    className={`flex items-center gap-1 text-[13px] font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-[#425466] hover:text-[#1a1f36]'}`}
                  >
                    Pacientes <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPatientsMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isPatientsMenuOpen && (
                    <div className={`absolute top-full left-0 mt-1 w-40 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                      <div className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Filtros rápidos</div>
                      {['Activos', 'Inactivos', 'Nuevos este mes', 'Con cita hoy'].map(f => (
                        <button key={f} onClick={() => setIsPatientsMenuOpen(false)} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className={`text-[14px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>{stats?.activePatients || 0} activos</div>
                </div>
              </div>
              
              {/* Faux straight line chart */}
              <div className={`mt-12 h-[2px] w-full relative flex items-end transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-[#e3e8ee]'}`}>
                <div className="absolute left-0 bottom-0 h-[2px] bg-[#80e9ff] transition-all duration-1000 ease-in-out" style={{ width: stats?.monthlyRevenue ? '33%' : '0%' }}></div>
                <div className="absolute left-0 bottom-0 h-[2px] bg-[#7a32fc] transition-all duration-1000 ease-in-out" style={{ width: stats?.monthlyRevenue ? '20%' : '0%' }}></div>
              </div>
              <div className={`flex justify-between text-[11px] mt-1 font-medium ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>
                <span>0:00</span>
                <span>23:59</span>
              </div>
            </div>

            {/* Right Col */}
            <div className="flex flex-col gap-6">
              {/* Row 1 */}
              <div className={`flex items-start justify-between border-b pb-6 transition-colors ${isDarkMode ? 'border-gray-800' : 'border-[#e3e8ee]'}`}>
                <div>
                  <div className={`text-[13px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#425466]'}`}>Citas (Esta semana)</div>
                  <div className={`text-[20px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats?.appointmentsThisWeek || 0}</div>
                </div>
                <button onClick={() => setActiveView('agenda')} className={`text-[13px] font-bold transition-colors mt-1 ${isDarkMode ? 'text-[#a5b4fc] hover:text-white' : 'text-[#5469d4] hover:text-[#1a1f36]'}`}>
                  Ver agenda
                </button>
              </div>
              {/* Row 2 */}
              <div className={`flex items-start justify-between border-b pb-6 transition-colors ${isDarkMode ? 'border-[#1f2937]' : 'border-[#e3e8ee]'}`}>
                <div>
                  <div className={`text-[13px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#425466]'}`}>Tasa de inasistencia (No-Show)</div>
                  <div className={`text-[20px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats?.noShowRate || 0}%</div>
                </div>
                <button onClick={() => setActiveView('insights')} className={`text-[13px] font-bold transition-colors mt-1 ${isDarkMode ? 'text-[#a5b4fc] hover:text-white' : 'text-[#5469d4] hover:text-[#1a1f36]'}`}>
                  Ver IA Insights
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TU RESUMEN Section */}
        <div className="mt-16">
          <h2 className={`text-[20px] font-bold tracking-tight mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Tu resumen</h2>
          
          {/* Toolbar */}
          <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6 transition-colors ${isDarkMode ? 'border-[#1f2937]' : 'border-[#e3e8ee]'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-[13px] font-medium mr-1 ${isDarkMode ? 'text-gray-500' : 'text-[#4f566b]'}`}>Intervalo de fechas</span>
              <div ref={resumenPeriodMenuRef} className="relative">
                <button 
                  onClick={() => setIsResumenPeriodMenuOpen(!isResumenPeriodMenuOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent rounded border border-transparent transition-colors dark:text-[#a5b4fc] ${isDarkMode ? 'hover:text-[#818cf8]' : 'hover:text-[#1a1f36]'}`}
                >
                  {activeResumenPeriod} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isResumenPeriodMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isResumenPeriodMenuOpen && (
                  <div className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                    {['Hoy', 'Últimos 7 días', 'Este mes', 'Este año', 'Período personalizado'].map(p => (
                      <button key={p} onClick={() => { setActiveResumenPeriod(p); setIsResumenPeriodMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div ref={diarioMenuRef} className="relative">
                <button 
                  onClick={() => setIsDiarioMenuOpen(!isDiarioMenuOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent rounded border border-transparent transition-colors dark:text-[#a5b4fc] ${isDarkMode ? 'hover:text-[#818cf8]' : 'hover:text-[#1a1f36]'}`}
                >
                  {activeDiarioPeriod} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDiarioMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDiarioMenuOpen && (
                  <div className={`absolute top-full left-0 mt-2 w-32 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                    {['Resumen', 'Diario', 'Detallado'].map(p => (
                      <button key={p} onClick={() => { setActiveDiarioPeriod(p); setIsDiarioMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`h-4 w-px mx-1 transition-colors ${isDarkMode ? 'bg-[#1f2937]' : 'bg-[#e3e8ee]'}`}></div>
              
              <div ref={compareMenuRef} className="relative">
                <button 
                  onClick={() => setIsCompareMenuOpen(!isCompareMenuOpen)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-[13px] font-medium transition-colors ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-[#1a1f36]'} ${isCompareActive ? 'text-[#5469d4]' : (isDarkMode ? 'text-gray-500' : 'text-[#4f566b]')}`}
                >
                  <X className={`w-3.5 h-3.5 transition-transform ${isCompareActive ? 'text-[#5469d4]' : 'text-[#8792a2] rotate-45'}`} />
                  Compara
                </button>
                {isCompareMenuOpen && (
                  <div className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                    <button onClick={() => { setIsCompareActive(true); setIsCompareMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>Activar comparación</button>
                    <button onClick={() => { setIsCompareActive(false); setIsCompareMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>Desactivar</button>
                  </div>
                )}
              </div>

              <div ref={prevPeriodMenuRef} className="relative">
                <button 
                  onClick={() => setIsPrevPeriodMenuOpen(!isPrevPeriodMenuOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-[#5469d4] bg-transparent rounded border border-transparent transition-colors dark:text-[#a5b4fc] ${isDarkMode ? 'hover:text-[#818cf8]' : 'hover:text-[#1a1f36]'}`}
                >
                  {activePrevPeriod} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPrevPeriodMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPrevPeriodMenuOpen && (
                  <div className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                    {['Período anterior', 'Año anterior', 'Personalizado'].map(p => (
                      <button key={p} onClick={() => { setActivePrevPeriod(p); setIsPrevPeriodMenuOpen(false); }} className={`w-full text-left px-4 py-1.5 text-[13px] ${isDarkMode ? 'text-gray-300 hover:bg-[#374151] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div ref={toolbarAddRef} className="relative">
                <button 
                  onClick={() => setIsToolbarAddOpen(!isToolbarAddOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold transition-colors border rounded-[6px] shadow-sm ${isDarkMode ? 'bg-[#1f2937] border-[#374151] text-white hover:border-[#4b5563]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:border-[#c1c9d2]'}`}
                >
                  <Plus className="w-3.5 h-3.5 text-[#5469d4]" /> Añadir
                </button>
                {isToolbarAddOpen && (
                  <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                    <button onClick={() => { setIsToolbarAddOpen(false); setIsAddPatientModalOpen(true); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Users className="w-4 h-4" /> Nuevo Paciente
                    </button>
                    <button onClick={() => { setIsToolbarAddOpen(false); setIsAddAppointmentModalOpen(true); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Grid className="w-4 h-4" /> Nueva Cita
                    </button>
                    <div className={`my-1 border-t ${isDarkMode ? 'border-[#374151]' : 'border-gray-100'}`}></div>
                    <button onClick={() => { setIsToolbarAddOpen(false); setIsAddServiceModalOpen(true); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Package className="w-4 h-4" /> Nuevo Servicio
                    </button>
                  </div>
                )}
              </div>
              <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold transition-colors border rounded-[6px] shadow-sm ${isDarkMode ? 'bg-[#1f2937] border-[#374151] text-white hover:border-[#4b5563]' : 'bg-white border-[#e3e8ee] text-[#1a1f36] hover:border-[#c1c9d2]'}`}>
                <Settings className="w-3.5 h-3.5 text-[#5469d4] opacity-80" /> Editar
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-0 border rounded-[8px] overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
            
            {/* Facturación Card */}
            <div className={`p-5 border-r flex flex-col h-[280px] transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
              <div className="flex items-center justify-between gap-1 mb-4">
                <div className={`flex items-center gap-1 text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>
                  Facturación <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                </div>
              </div>
              <div className={`flex-1 flex flex-col items-center justify-center`}>
                <span className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                  {stats?.monthlyRevenue ? formatCurrency(stats.monthlyRevenue) : '0,00 €'}
                </span>
                <span className={`text-[12px] mt-1 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Este mes</span>
              </div>
            </div>

            {/* Specialty-Specific KPIs */}
            {currentSpecialtyConfig.kpis.map((kpi, idx) => (
              <div key={idx} className={`p-5 border-r flex flex-col h-[280px] transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                <div className="flex items-center justify-between gap-1 mb-4">
                  <div className={`flex items-center gap-1 text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>
                    {kpi.label} <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                  </div>
                </div>
                <div className={`flex-1 flex flex-col items-center justify-center`}>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                      {kpi.prefix}{Math.floor(Math.random() * 80) + 20}{kpi.suffix}
                    </span>
                  </div>
                  <span className={`text-[12px] mt-1 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Métrica {clinicConfig.specialty}</span>
                </div>
              </div>
            ))}

            {!currentSpecialtyConfig.kpis.length && (
              <>
                <div className={`p-5 border-r flex flex-col h-[280px] transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className={`flex items-center gap-1 text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>
                      Citas <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats?.appointmentsThisWeek || 0}</span>
                    <span className="text-[12px] mt-1 font-medium text-gray-400">Esta semana</span>
                  </div>
                </div>
                <div className={`p-5 flex flex-col h-[280px] transition-colors ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className={`flex items-center gap-1 text-[13px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#1a1f36]'}`}>
                      Pacientes Activos <Info className="w-3.5 h-3.5 text-[#8792a2]" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className={`text-[24px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{stats?.activePatients || 0}</span>
                    <span className="text-[12px] mt-1 font-medium text-gray-400">Total</span>
                  </div>
                </div>
              </>
            )}

          </div>
          
        </div>

        {/* ACTIVIDAD RECIENTE Section */}
        <div className="mt-12">
          <h2 className={`text-[16px] font-bold tracking-tight mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Agenda del Día</h2>
          <div className={`border rounded-[8px] overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b transition-colors ${isDarkMode ? 'border-gray-800 bg-[#0f172a]' : 'border-[#e3e8ee] bg-[#f6f9fc]'}`}>
                    <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider w-[100px] dark:text-gray-500">Hora</th>
                    <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider dark:text-gray-500">Paciente</th>
                    <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider dark:text-gray-500">Tratamiento</th>
                    <th className="px-4 py-2 text-[12px] font-medium text-[#4f566b] uppercase tracking-wider text-right dark:text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y transition-colors divide-gray-200 dark:divide-gray-800">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-[#4f566b] dark:text-gray-500">No hay citas el día de hoy</td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className={`transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#f6f9fc]'}`} onClick={() => setActiveView('agenda')}>
                        <td className={`px-4 py-3 text-[13px] font-medium ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>{apt.startTime}</td>
                        <td className={`px-4 py-3 text-[13px] ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>{apt.patientName}</td>
                        <td className={`px-4 py-3 text-[13px] ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>{apt.type}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium ${
                            apt.status === 'CONFIRMED' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-[#e3f2fd] text-[#0d47a1]') : 
                            apt.status === 'IN-PROGRESS' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-[#e8f5e9] text-[#1b5e20]') : 
                            (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-[#fff3e0] text-[#e65100]')
                          }`}>
                            {apt.status === 'CONFIRMED' ? 'Confirmada' : apt.status === 'IN-PROGRESS' ? 'En sala' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-screen w-full font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] text-[#f8fafc] dark' : 'bg-[#f6f9fc] text-[#425466]'}`}>
      
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
        )}

          {/* Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 w-64 border-r flex flex-col shrink-0 z-[60] transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isDarkMode ? 'bg-[#0f172a] border-[#1f2937]' : 'bg-[#f6f9fc] border-[#e3e8ee]'}`}>
          {/* Account Selector */}
          <div ref={accountMenuRef} className={`p-4 pt-5 relative z-20 transition-colors ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f6f9fc]'}`}>
            <button 
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className={`w-[calc(100%-16px)] mx-2 mt-4 mb-2 flex items-center justify-between px-2 py-1.5 rounded-[6px] border transition-all ${isAccountMenuOpen ? (isDarkMode ? 'bg-[#1e293b] border-transparent' : 'bg-[#e3e8ee] border-transparent') : (isDarkMode ? 'bg-transparent border-transparent hover:bg-[#1e293b]' : 'bg-transparent border-transparent hover:bg-[#e3e8ee]')}`}
            >
              <div className="flex items-center gap-2 text-left overflow-hidden">
                <NexoraLogo size={24} color={currentSpecialtyConfig.primaryColor} />
                <div className="min-w-0">
                  <div className={`text-[13px] font-bold leading-tight truncate ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                    {clinicConfig.name}
                  </div>
                  <div className={`text-[12px] leading-tight mt-0.5 truncate ${isDarkMode ? 'text-gray-500 font-bold' : 'text-[#4f566b] font-medium'}`}>
                    Nexora {clinicConfig.specialty}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8792a2] shrink-0" />
            </button>

            {/* Account Popover Menu */}
            {isAccountMenuOpen && (
              <div className={`absolute top-[86px] left-3 w-[260px] rounded-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col z-[100] py-2 border transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e3e8ee]'}`}>
                <div className="px-5 py-4 pb-2 flex flex-col items-center">
                  <NexoraLogo size={48} className="mb-3" color={currentSpecialtyConfig.primaryColor} />
                  <div className={`text-[15px] font-bold text-center w-full truncate ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>
                    {currentSpecialtyConfig.productName}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded mt-2 mb-4 bg-gray-500/10 text-gray-500`}>
                    Modo {clinicConfig.specialty}
                  </div>
                </div>
                
                <div className={`py-1 border-t ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
                  <button 
                    onClick={() => {
                      setActiveView('configuracion');
                      setIsAccountMenuOpen(false);
                    }}
                    className={`w-full text-left px-5 py-2.5 flex items-center gap-3 text-[13px] font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}
                  >
                    <Settings className="w-[16px] h-[16px]" /> Configuración
                  </button>
                  <button className={`w-full text-left px-5 py-2.5 flex items-center justify-between text-[13px] font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                    <div className="flex items-center gap-3">
                      <Package className="w-[16px] h-[16px] text-amber-500" /> Cambiar plan
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-30" />
                  </button>
                </div>

                <div className={`py-1 border-t transition-colors ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
                  <button className={`w-full text-left px-5 py-2.5 flex items-center justify-between text-[13px] font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#334155] hover:text-white' : 'text-[#4f566b] hover:bg-[#f6f9fc] hover:text-[#1a1f36]'}`}>
                    <div className="flex items-center gap-3">
                      <Grid className="w-[16px] h-[16px]" /> Otras cuentas
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-30" />
                  </button>
                </div>

                <div className={`py-1 border-t transition-colors ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
                  <div className={`w-full text-left px-5 py-2.5 flex items-center justify-between text-[13px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#4f566b]'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#008477] text-white flex items-center justify-center text-[10px]">I</div>
                      {clinicConfig.owner}
                    </div>
                    <Info className="w-[14px] h-[14px] opacity-30" />
                  </div>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full text-left px-5 py-2.5 flex items-center gap-3 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-[16px] h-[16px]" /> Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-0.5 mt-2 overflow-y-auto pb-4">
            <button 
              onClick={() => handleMenuClick('inicio')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-[4px] font-semibold text-[13px] transition-colors ${activeView === 'inicio' ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
            >
              <Home className={`w-4 h-4 ${activeView === 'inicio' ? (isDarkMode ? 'text-blue-400' : currentSpecialtyConfig.accentColor) : 'text-[#8792a2]'}`} />
              Inicio
            </button>

            {currentSpecialtyConfig.specializedItems.length > 0 && (
              <>
                <div className={`mt-6 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Herramientas {clinicConfig.specialty}</div>
                {currentSpecialtyConfig.specializedItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)} 
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${activeView === item.id ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${activeView === item.id ? currentSpecialtyConfig.accentColor : 'text-[#8792a2]'}`}>{item.icon}</div>
                      {item.label}
                    </div>
                  </button>
                ))}
              </>
            )}

            <div className={`mt-6 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Gestión Principal</div>
            {[
              { id: 'agenda', label: 'Agenda', icon: Grid },
              { id: 'pacientes', label: 'Clientes / Pacientes', icon: Users, isActive: activeView === 'pacientes' || activeView === 'historial_clinico' },
              { id: 'tratamientos', label: 'Servicios', icon: Package },
              { id: 'staff', label: 'Personal y Turnos', icon: User },
              { id: 'telemedicina', label: 'Videoconsulta', icon: Video },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => handleMenuClick(item.id)} 
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${(item as any).isActive || activeView === item.id ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${(item as any).isActive || activeView === item.id ? (isDarkMode ? 'text-blue-400' : 'text-[#5469d4]') : 'text-[#8792a2]'}`} />
                  {item.label}
                </div>
              </button>
            ))}

            <div className={`mt-8 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Negocio</div>
            {[
              { id: 'facturación', label: 'Facturación', icon: CreditCard },
              { id: 'análisis', label: 'Análisis', icon: BarChart },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => handleMenuClick(item.id)} 
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${activeView === item.id ? (isDarkMode ? 'bg-[#334155] text-white' : 'bg-[#e3e8ee] text-[#000000]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${activeView === item.id ? (isDarkMode ? 'text-blue-400' : 'text-[#5469d4]') : 'text-[#8792a2]'}`} />
                  {item.label}
                </div>
              </button>
            ))}

            <div className={`mt-8 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`}>Plataforma</div>
            <button 
              onClick={() => setIsNexoraAiOpen(!isNexoraAiOpen)} 
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]'} ${isNexoraAiOpen ? (isDarkMode ? 'text-white' : 'text-[#1a1f36]') : ''}`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-[#8792a2]" />
                Inteligencia Nexora
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8792a2] transition-transform ${isNexoraAiOpen ? 'rotate-180' : ''}`} />
            </button>

            {isNexoraAiOpen && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {[
                  { id: 'automatizaciones', label: 'Automatizaciones' },
                  { id: 'insights', label: 'Insights Avanzados' },
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)} 
                    className={`w-full flex items-center justify-between px-3 py-1.5 pl-10 rounded-[4px] font-medium text-[13px] transition-colors ${activeView === item.id ? (isDarkMode ? 'bg-[#334155] text-white border-l-2 border-blue-400' : 'bg-[#e3e8ee] text-[#1a1f36] border-l-2 border-[#5469d4]') : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-[#425466] hover:text-[#1a1f36] hover:bg-[#e3e8ee]')}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            
          </nav>

          <div className="p-4 mt-auto">
            <button onClick={() => handleMenuClick('desarrolladores')} className="w-full flex items-center justify-between px-2 py-1.5 text-[#425466] hover:text-[#1a1f36] font-medium text-[13px]">
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-[#8792a2]" />
                Desarrolladores
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.02)] relative z-10 md:rounded-tl-2xl transition-colors ${isDarkMode ? 'bg-[#111827]' : 'bg-white'}`}>
          
          {/* Header Row */}
          <header className={`flex items-center justify-between px-4 md:px-8 py-4 border-b sticky top-0 z-30 transition-colors ${isDarkMode ? 'bg-[#111827] border-[#1f2937]' : 'bg-white border-[#e3e8ee] md:border-b-0'}`}>
            <div className="flex items-center gap-3 flex-1 md:flex-none">
              <button 
                className={`md:hidden p-2 -ml-2 rounded-[4px] transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#1f2937]' : 'text-[#4f566b] hover:bg-[#f6f9fc]'}`} 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
              </button>
              
              <div className={`hidden md:flex items-center gap-3 border rounded-[4px] px-3 py-1.5 w-80 text-[13px] font-medium transition-colors focus-within:ring-1 ${isDarkMode ? 'bg-[#1f2937] border-[#374151] text-white focus-within:border-blue-500 focus-within:ring-blue-500' : 'bg-[#f6f9fc] border-[#e3e8ee] focus-within:border-[#5469d4] focus-within:ring-[#5469d4]'}`}>
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-[#8792a2]'}`} />
                <input type="text" placeholder="Buscar clientes o citas..." className={`bg-transparent border-none outline-none w-full placeholder:text-[#8792a2] ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`} />
              </div>
            </div>

            <div className={`flex items-center gap-3 md:gap-4 ${isDarkMode ? 'text-[#94a3b8]' : 'text-[#4f566b]'}`}>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-all hover:scale-110 ${isDarkMode ? 'bg-[#1f2937] text-yellow-400' : 'bg-[#f1f5f9] text-[#5469d4]'}`}
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <Search className={`w-[18px] h-[18px] cursor-pointer md:hidden ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              <Grid className={`w-[18px] h-[18px] cursor-pointer hidden sm:block ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              <HelpCircle className={`w-[18px] h-[18px] cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              <Bell className={`w-[18px] h-[18px] cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              <Settings className={`w-[18px] h-[18px] cursor-pointer hidden sm:block ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1a1f36]'}`} />
              
              <div ref={globalAddRef} className="relative">
                <div 
                  onClick={() => setIsGlobalAddOpen(!isGlobalAddOpen)}
                  className={`hidden md:flex w-[28px] h-[28px] ${currentSpecialtyConfig.secondaryColor} text-white rounded-full items-center justify-center cursor-pointer shadow-sm hover:opacity-90 ml-1`}
                >
                  <Plus className={`w-4 h-4 transition-transform ${isGlobalAddOpen ? 'rotate-45' : ''}`} />
                </div>
                {isGlobalAddOpen && (
                  <div className={`absolute top-full right-0 mt-3 w-48 rounded-lg shadow-xl border z-50 py-1 transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e3e8ee]'}`}>
                    <button onClick={() => { setIsGlobalAddOpen(false); setIsAddPatientModalOpen(true); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Users className="w-4 h-4" /> Nuevo Paciente
                    </button>
                    <button onClick={() => { setIsGlobalAddOpen(false); setIsAddAppointmentModalOpen(true); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Grid className="w-4 h-4" /> Nueva Cita
                    </button>
                    <div className={`my-1 border-t ${isDarkMode ? 'border-[#374151]' : 'border-gray-100'}`}></div>
                    <button onClick={() => { setIsGlobalAddOpen(false); setIsAddServiceModalOpen(true); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white hover:bg-[#374151]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Package className="w-4 h-4" /> Nuevo Servicio
                    </button>
                  </div>
                )}
              </div>
              
              {/* Profile Avatar instead of config guide */}
              <div className="ml-2 w-8 h-8 rounded-full bg-[#1a1f36] text-white flex items-center justify-center text-[12px] font-bold shadow-sm cursor-pointer border border-[#e3e8ee]">
                IK
              </div>
            </div>
          </header>

          {renderContent()}

        </main>
      </div>
      {/* Appointment Modal -> To append before final div of component */}
      
      {isAddShiftModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[12px] shadow-2xl ${isDarkMode ? 'bg-[#1e293b] border border-[#334155]' : 'bg-white'}`}>
            <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
              <h2 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Asignar Turno o Vacaciones</h2>
              <button onClick={() => setIsAddShiftModalOpen(false)} className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddShiftSubmit} className="p-5 space-y-4">
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Personal</label>
                <select 
                  required
                  value={newShiftForm.userId}
                  onChange={e => setNewShiftForm({...newShiftForm, userId: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                >
                  <option value="">Seleccionar miembro...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Tipo</label>
                <select 
                  value={newShiftForm.type}
                  onChange={e => setNewShiftForm({...newShiftForm, type: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                >
                  <option value="WORK">Trabajo</option>
                  <option value="VACATION">Vacaciones / Libre</option>
                  <option value="SICK_LEAVE">Baja Médica</option>
                </select>
              </div>

              {newShiftForm.type === 'WORK' && (
                <div>
                  <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Sala / Consulta (Opcional)</label>
                  <select 
                    value={newShiftForm.roomId}
                    onChange={e => setNewShiftForm({...newShiftForm, roomId: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                  >
                    <option value="">Cualquier sala...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Fecha</label>
                  <input 
                    type="date" 
                    required
                    value={newShiftForm.date}
                    onChange={e => setNewShiftForm({...newShiftForm, date: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Hora Inicio</label>
                  <input 
                    type="time" 
                    required
                    value={newShiftForm.startTime}
                    onChange={e => setNewShiftForm({...newShiftForm, startTime: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                  />
                </div>
                <div>
                  <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Hora Fin</label>
                  <input 
                    type="time" 
                    required
                    value={newShiftForm.endTime}
                    onChange={e => setNewShiftForm({...newShiftForm, endTime: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Notas (Opcional)</label>
                <textarea 
                  value={newShiftForm.notes}
                  onChange={e => setNewShiftForm({...newShiftForm, notes: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors min-h-[60px] ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6 dark:border-[#334155]">
                <button type="button" onClick={() => setIsAddShiftModalOpen(false)} className={`px-4 py-2 bg-transparent text-[14px] font-medium rounded-[4px] border ${isDarkMode ? 'border-[#334155] text-white hover:bg-[#334155]' : 'border-[#e3e8ee] text-[#4f566b] hover:bg-[#f6f9fc]'}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingShift} className="px-4 py-2 bg-[#5469d4] hover:bg-[#4c5ed1] text-white text-[14px] font-medium rounded-[4px] shadow-sm disabled:opacity-50">
                  {isSubmittingShift ? 'Guardando...' : 'Asignar Turno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-[12px] shadow-2xl ${isDarkMode ? 'bg-[#1e293b] border border-[#334155]' : 'bg-white'}`}>
            <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
              <h2 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Añadir Sala</h2>
              <button onClick={() => setIsAddRoomModalOpen(false)} className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRoomSubmit} className="p-5 space-y-4">
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Nombre de la Sala</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Consulta 3"
                  value={newRoomForm.name}
                  onChange={e => setNewRoomForm({...newRoomForm, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6 dark:border-[#334155]">
                <button type="button" onClick={() => setIsAddRoomModalOpen(false)} className={`px-4 py-2 bg-transparent text-[14px] font-medium rounded-[4px] border ${isDarkMode ? 'border-[#334155] text-white hover:bg-[#334155]' : 'border-[#e3e8ee] text-[#4f566b] hover:bg-[#f6f9fc]'}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingRoom} className="px-4 py-2 bg-[#5469d4] hover:bg-[#4c5ed1] text-white text-[14px] font-medium rounded-[4px] shadow-sm disabled:opacity-50">
                  {isSubmittingRoom ? 'Guardando...' : 'Crear Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-[12px] shadow-2xl ${isDarkMode ? 'bg-[#1e293b] border border-[#334155]' : 'bg-white'}`}>
            <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#334155]' : 'border-[#e3e8ee]'}`}>
              <h2 className={`text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1a1f36]'}`}>Editar Sala</h2>
              <button onClick={() => {setIsEditRoomModalOpen(false); setEditingRoom(null);}} className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditRoomSubmit} className="p-5 space-y-4">
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#4f566b]'}`}>Nombre de la Sala</label>
                <input 
                  type="text" 
                  required
                  value={editingRoom?.name || ''}
                  onChange={e => setEditingRoom({...editingRoom, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-[6px] text-[14px] outline-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-[#334155] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-white border-[#e3e8ee] text-[#1a1f36] focus:border-[#5469d4] focus:ring-1 focus:ring-[#5469d4]'}`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6 dark:border-[#334155]">
                <button type="button" onClick={() => {setIsEditRoomModalOpen(false); setEditingRoom(null);}} className={`px-4 py-2 bg-transparent text-[14px] font-medium rounded-[4px] border ${isDarkMode ? 'border-[#334155] text-white hover:bg-[#334155]' : 'border-[#e3e8ee] text-[#4f566b] hover:bg-[#f6f9fc]'}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingRoom} className="px-4 py-2 bg-[#5469d4] hover:bg-[#4c5ed1] text-white text-[14px] font-medium rounded-[4px] shadow-sm disabled:opacity-50">
                  {isSubmittingRoom ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
