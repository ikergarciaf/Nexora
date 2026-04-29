import { useState, useEffect, useCallback } from 'react';

import { aiService } from '../services/aiService';

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
      const headers = { 
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}`,
        'Content-Type': 'application/json'
      };

      const [patientsRes, appointmentsRes, statsRes, configRes] = await Promise.all([
        fetch('/api/patients', { headers }),
        fetch('/api/appointments', { headers }),
        fetch('/api/dashboard/stats', { headers }),
        fetch('/api/tenant/config', { headers })
      ]);

      if (patientsRes.ok) setPatients(await patientsRes.json());
      if (appointmentsRes.ok) setAppointments(await appointmentsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (configRes.ok) setTenantConfig(await configRes.json());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Expose an optimistic update method
  const addPatientLocally = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  return { patients, appointments, stats, tenantConfig, isLoading, refreshData: fetchData, addPatientLocally };
}

export async function createPatientApi(data: { fullName: string, email?: string, phone?: string }): Promise<Patient | null> {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}` 
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error("Failed to create");
    return await response.json();
  } catch (error) {
    console.error('Patient API error:', error);
    return null;
  }
}

export async function updatePatientApi(id: string, data: any) {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}`
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to update patient:', error);
    return false;
  }
}

export async function deletePatientApi(id: string) {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch(`/api/patients/${id}`, {
      method: 'DELETE',
      headers: {
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to delete patient:', error);
    return false;
  }
}

export async function updateTenantConfigApi(data: any): Promise<boolean> {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch('/api/tenant/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}`
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to update config:', error);
    return false;
  }
}

export async function createAppointmentApi(data: { patientId: string, doctorId?: string, startTime: string, durationMinutes: number }): Promise<Appointment | null> {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}` 
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error("Failed to create appointment");
    return await response.json();
  } catch (error) {
    console.error('Appointment API error:', error);
    return null;
  }
}

export async function updateAppointmentApi(id: string, data: any) {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}`
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return false;
  }
}

export async function deleteAppointmentApi(id: string) {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    return false;
  }
}

export async function fetchPatientRecordApi(id: string): Promise<any | null> {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch(`/api/patients/${id}`, {
      headers: {
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}`
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch patient record', err);
    return null;
  }
}

export async function savePatientRecordApi(id: string, record: any): Promise<boolean> {
  try {
    const token = localStorage.getItem('clinic_token');
    const response = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
        'Authorization': `Bearer ${token || 'demo-token'}`
      },
      body: JSON.stringify({ 
        medicalRecord: record,
        exercises: record.exercises,
        nutritionalPlan: record.nutritionPlan // Mapping from UI state name to DB field name
      })
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to save record', err);
    return false;
  }
}

export async function generatePatientSummary(notes: string) {
  try {
    return await aiService.summarizePatientHistory(notes);
  } catch (error) {
    console.error('Failed to generate summary', error);
    return null;
  }
}

export async function generateWhatsAppDraft(patientName: string, appointmentType: string, time: string, goal: 'reminder' | 'follow_up' | 'reactivation' = 'reminder') {
  try {
    return await aiService.generateWhatsAppDraft(patientName, appointmentType, time, goal);
  } catch (error) {
    console.error('Failed to generate whatsapp draft', error);
    return null;
  }
}
