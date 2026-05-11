import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/httpClient';

export interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  tags: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  type: string;
  startTime: string;
  room: string;
  status: string;
  aiAlert?: boolean;
  aiScore?: number;
}

export interface DashboardStats {
  monthlyRevenue: number;
  revenueGrowth: number;
  appointmentsThisWeek: number;
  activePatients: number;
  noShowRate: number;
  todayAppointments: number;
}

export function useDashboardData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tenantConfig, setTenantConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('clinic_token');
      if (!token) return;

      const [patientsRes, appointmentsRes, statsRes, configRes] = await Promise.all([
        api.get<any>('/api/patients'),
        api.get<any>('/api/appointments?limit=50'),
        api.get<any>('/api/dashboard/stats'),
        api.get<any>('/api/tenant/config'),
      ]);

      if (patientsRes) setPatients(Array.isArray(patientsRes) ? patientsRes : patientsRes.data || []);
      if (appointmentsRes) setAppointments(Array.isArray(appointmentsRes) ? appointmentsRes : appointmentsRes.data || []);
      if (statsRes) setStats(statsRes);
      if (configRes) setTenantConfig(configRes);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { patients, appointments, stats, tenantConfig, isLoading, refreshData: fetchData };
}

export async function createPatientApi(data: { fullName: string, email?: string, phone?: string }): Promise<Patient | null> {
  return api.post<Patient>('/api/patients', data);
}

export async function updatePatientApi(id: string, data: any): Promise<boolean> {
  const res = await api.put(`/api/patients/${id}`, data);
  return res !== null;
}

export async function deletePatientApi(id: string): Promise<boolean> {
  const res = await api.delete(`/api/patients/${id}`);
  return res !== null;
}

export async function updateTenantConfigApi(data: any): Promise<boolean> {
  const res = await api.post('/api/tenant/config', data);
  return res !== null;
}

export async function createAppointmentApi(data: { patientId: string, doctorId?: string, startTime: string, durationMinutes: number }): Promise<Appointment | null> {
  return api.post<Appointment>('/api/appointments', data);
}

export async function updateAppointmentApi(id: string, data: any): Promise<boolean> {
  const res = await api.put(`/api/appointments/${id}`, data);
  return res !== null;
}

export async function deleteAppointmentApi(id: string): Promise<boolean> {
  const res = await api.delete(`/api/appointments/${id}`);
  return res !== null;
}

export async function fetchPatientRecordApi(id: string): Promise<any | null> {
  return api.get(`/api/patients/${id}`);
}

export async function savePatientRecordApi(id: string, record: any): Promise<boolean> {
  const res = await api.put(`/api/patients/${id}`, {
    medicalRecord: record,
    nutritionalPlan: record.nutritionPlan,
  });
  return res !== null;
}

export async function generatePatientSummary(notes: string) {
  try {
    const { aiService } = await import('../services/aiService');
    return await aiService.summarizePatientHistory(notes);
  } catch {
    return null;
  }
}
