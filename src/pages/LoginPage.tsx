import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { NexoraLogo } from '../components/NexoraLogo';
import { useModal } from '../components/ModalContext';
import { setTokens } from '../services/httpClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleAuthSuccess = (data: any) => {
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    navigate('/tenants');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Autenticación fallida');
      }

      handleAuthSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    try {
      setLoading(true);
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        setError('Google login no está configurado. Regístrate con email y contraseña.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: 'demo-google-token' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en demo login');

      handleAuthSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex justify-center">
          <NexoraLogo size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {isLogin ? 'Accede a tu panel de gestión clínica' : '14 días gratis, sin tarjeta'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008477] focus:border-[#008477] text-sm transition-shadow"
                  placeholder="Dr. García"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Correo electrónico</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008477] focus:border-[#008477] text-sm transition-shadow"
                placeholder="tu@clinica.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => openModal('forgot-password')}
                    className="text-xs font-medium text-[#008477] hover:text-[#007066]"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008477] focus:border-[#008477] text-sm transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#008477] hover:bg-[#007066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008477] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Entrar' : 'Crear cuenta')}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-400">O continúa con</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleMockGoogleLogin}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-[#008477]/30 rounded-lg shadow-sm bg-white text-sm font-medium text-[#008477] hover:bg-teal-50 transition-colors disabled:opacity-60"
                >
                  Demo rápido (sin Google)
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm font-medium text-[#008477] hover:text-[#007066]"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
