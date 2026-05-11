import { useState, useCallback } from 'react';
import { api } from '../services/httpClient';

export function useStaffData() {
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaffData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, roomsData, shiftsData] = await Promise.all([
        api.get<any[]>('/api/staff/users'),
        api.get<any[]>('/api/staff/rooms'),
        api.get<any[]>('/api/staff/shifts'),
      ]);
      if (usersData) setUsers(Array.isArray(usersData) ? usersData : []);
      if (roomsData) setRooms(Array.isArray(roomsData) ? roomsData : []);
      if (shiftsData) setShifts(Array.isArray(shiftsData) ? shiftsData : []);
    } catch (error) {
      console.error('Failed to load staff data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, rooms, shifts, isLoading, refreshStaffData: fetchStaffData };
}

async function apiPost(path: string, body: any) {
  return api.post(path, body);
}

async function apiDelete(path: string) {
  return api.delete(path);
}

async function apiPut(path: string, body: any) {
  return api.put(path, body);
}

export async function createShiftApi(data: any) {
  const res = await apiPost('/api/staff/shifts', data);
  if (!res) throw new Error('Failed to create shift');
  return res;
}

export async function deleteShiftApi(id: string) {
  const res = await apiDelete(`/api/staff/shifts/${id}`);
  if (!res) throw new Error('Failed to delete shift');
  return res;
}

export async function createRoomApi(data: any) {
  const res = await apiPost('/api/staff/rooms', data);
  if (!res) throw new Error('Failed to create room');
  return res;
}

export async function updateRoomApi(id: string, data: any) {
  const res = await apiPut(`/api/staff/rooms/${id}`, data);
  if (!res) throw new Error('Failed to update room');
  return res;
}

export async function deleteRoomApi(id: string) {
  const res = await apiDelete(`/api/staff/rooms/${id}`);
  if (!res) throw new Error('Failed to delete room');
  return res;
}
