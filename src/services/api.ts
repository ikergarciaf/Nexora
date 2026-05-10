export function apiHeaders() {
  const token = localStorage.getItem('clinic_token');
  return {
    'Content-Type': 'application/json',
    'x-tenant-id': localStorage.getItem('active_tenant_id') || '',
    'Authorization': `Bearer ${token}`,
  };
}
