import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { Loader2, ArrowRight } from 'lucide-react';
import { NexoraLogo } from '../components/NexoraLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

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

      localStorage.setItem('clinic_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      navigate('/tenants');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error con Google');
      
      localStorage.setItem('clinic_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      navigate('/tenants');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Error al conectar con Google')
  });

  const handleMockGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: 'demo-google-token' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en demo login');
      
      localStorage.setItem('clinic_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      navigate('/tenants');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex justify-center">
          <NexoraLogo size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-gray-900">
          {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta Nexora'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700">Nombre completo</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700">Correo Electrónico</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-[#008477] hover:bg-[#007066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008477] disabled:opacity-70 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Entrar' : 'Registrarse')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 items-center">
              <GoogleLogin 
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Error al conectar con Google')}
                useOneTap
                theme="outline"
                width="100%"
              />
              
              <button
                type="button"
                onClick={handleMockGoogleLogin}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-[#008477] rounded-xl shadow-sm bg-white text-sm font-bold text-[#008477] hover:bg-teal-50 transition-all"
              >
                Demo (Sin necesidad de Google)
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-[#008477] hover:text-[#007066]"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
