import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, ArrowRight, ShieldCheck, LogOut } from 'lucide-react';
import { NexoraLogo } from '../components/NexoraLogo';

export default function TenantSelector() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSaaSName, setNewSaaSName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('clinic_token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // User info
    try {
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      setUser(userInfo);
    } catch(e) {}

    fetchTenants();
  }, [navigate]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/tenants', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('clinic_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setTenants(data);
    } catch (e) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSaaS = (tenantId: string, tenantName: string) => {
    localStorage.setItem('active_tenant_id', tenantId);
    localStorage.setItem('clinic-name', tenantName);
    navigate('/dashboard');
  };

  const handleCreateSaaS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaaSName) return;

    try {
      const res = await fetch('/api/auth/tenants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('clinic_token')}`
        },
        body: JSON.stringify({ name: newSaaSName })
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsCreating(false);
        setNewSaaSName('');
        fetchTenants();
      }
    } catch(e) {
      console.error(e);
    }
  };

  const logout = () => {
    localStorage.removeItem('clinic_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('active_tenant_id');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
      <div className="max-w-4xl mx-auto w-full px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <NexoraLogo size={32} />
            <span className="text-xl font-black text-gray-900">Bienvenido/a, {user?.name || 'Usuario'}</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
            Cerrar sesión <LogOut className="w-4 h-4" />
          </button>
        </div>

        {user?.isSuperAdmin && (
          <div className="mb-6 bg-purple-50 text-purple-700 p-4 rounded-xl flex items-center gap-3 border border-purple-100 font-medium">
            <ShieldCheck className="w-5 h-5" />
            Ves esto porque eres Administrador Global. Puedes acceder a cualquier clínica sin pagar.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Tus clínicas (SaaS)</h1>
              <p className="text-gray-500 mt-1">Selecciona la clínica que deseas gestionar hoy</p>
            </div>
            {!isCreating && (
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 bg-[#008477] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#007066] transition-colors"
              >
                <Plus className="w-4 h-4" /> Crear nuevo SaaS
              </button>
            )}
          </div>
          
          <div className="p-8 bg-gray-50/50">
            {isCreating ? (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">¿Cómo se llama tu nueva clínica?</h3>
                <form onSubmit={handleCreateSaaS} className="flex gap-3">
                  <input
                    type="text"
                    value={newSaaSName}
                    onChange={(e) => setNewSaaSName(e.target.value)}
                    placeholder="Ej. Clínica Dental Sonrisas"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008477] focus:border-[#008477] font-medium"
                    autoFocus
                  />
                  <button type="submit" disabled={!newSaaSName} className="bg-[#008477] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#007066] disabled:opacity-50">
                    Contratar Nuevo SaaS
                  </button>
                  <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                    Cancelar
                  </button>
                </form>
              </div>
            ) : null}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008477]"></div>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-900">Aún no tienes ningún SaaS contratado</h3>
                <p className="mt-1 text-sm text-gray-500">Haz clic en el botón superior para crear tu primera clínica.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenants.map(tenant => (
                  <div 
                    key={tenant.id}
                    onClick={() => handleSelectSaaS(tenant.id, tenant.name)}
                    className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#008477] hover:shadow-md cursor-pointer transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center text-[#008477]">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-[#008477] transition-colors">{tenant.name}</h4>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">Plan {tenant.subscriptionPlan}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#008477] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
