// src/hooks/useStaffData.ts
import { useState, useCallback } from 'react';

export function useStaffData() {
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaffData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('clinic_token');
      const headers = { 
        'Authorization': `Bearer ${token || 'demo-token'}`,
        'Content-Type': 'application/json'
      };

      const [usersRes, roomsRes, shiftsRes] = await Promise.all([
        fetch('/api/staff/users', { headers }),
        fetch('/api/staff/rooms', { headers }),
        fetch('/api/staff/shifts', { headers })
      ]);

      if (usersRes.ok && roomsRes.ok && shiftsRes.ok) {
        setUsers(await usersRes.json());
        setRooms(await roomsRes.json());
        setShifts(await shiftsRes.json());
      }
    } catch (error) {
      console.error('Failed to load staff data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, rooms, shifts, isLoading, refreshStaffData: fetchStaffData };
}

export async function createShiftApi(data: any) {
  const token = localStorage.getItem('clinic_token');
  const response = await fetch('/api/staff/shifts', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || 'demo-token'}` 
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create shift');
  return response.json();
}

export async function deleteShiftApi(id: string) {
  const token = localStorage.getItem('clinic_token');
  const response = await fetch(`/api/staff/shifts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token || 'demo-token'}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete shift');
  return response.json();
}

export async function createRoomApi(data: any) {
  const token = localStorage.getItem('clinic_token');
  const response = await fetch('/api/staff/rooms', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || 'demo-token'}` 
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create room');
  return response.json();
}

export async function updateRoomApi(id: string, data: any) {
  const token = localStorage.getItem('clinic_token');
  const response = await fetch(`/api/staff/rooms/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || 'demo-token'}` 
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update room');
  return response.json();
}

export async function deleteRoomApi(id: string) {
  const token = localStorage.getItem('clinic_token');
  const response = await fetch(`/api/staff/rooms/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token || 'demo-token'}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete room');
  return response.json();
}
