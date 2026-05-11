import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';

const CLINIC_TYPES = [
  { value: 'Fisioterapia', label: 'Fisioterapia', desc: 'Nexora Fisioterapia' },
  { value: 'Odontología', label: 'Odontología / Dental', desc: 'Nexora Dental' },
  { value: 'Nutrición', label: 'Nutrición / Dietética', desc: 'Nexora Nutrición' },
  { value: 'Psicología', label: 'Psicología', desc: 'Nexora Psicología' },
  { value: 'Estética', label: 'Medicina Estética', desc: 'Nexora Estética' },
  { value: 'Medicina General', label: 'Medicina General', desc: 'Nexora Clinical' },
];

interface DemoFormProps {
  onSuccess: () => void;
  initialData?: Record<string, string>;
}

export default function DemoForm({ onSuccess, initialData = {} }: DemoFormProps) {
  const navigate = useNavigate();
  const isQuote = initialData.type === 'quote';
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    clinicType: initialData.specialty || 'Fisioterapia',
    clinicName: '',
    password: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isQuote) {
        setStep('success');
        return;
      }

      const res = await fetch('/api/auth/demo-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrarse');

      localStorage.setItem('clinic_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      localStorage.setItem('active_tenant_id', data.tenant.id);
      localStorage.setItem('clinic-name', data.tenant.name);

      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          {isQuote ? '¡Solicitud enviada!' : '¡Registro completado!'}
        </h2>
        <p className="mt-2 text-gray-500">
          {isQuote
            ? 'Recibirás una propuesta personalizada en tu correo en menos de 24h.'
            : 'Tu prueba gratuita de 14 días ha comenzado. Bienvenido/a a Nexora.'}
        </p>
        <button
          onClick={() => {
            onSuccess();
            if (!isQuote) navigate('/dashboard');
          }}
          className="mt-8 bg-[#008477] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#007066] transition-colors"
        >
          {isQuote ? 'Volver' : 'Ir a mi panel'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isQuote ? 'Solicita tu presupuesto' : 'Prueba Nexora gratis 14 días'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isQuote ? 'Te contactaremos en menos de 24h.' : 'Sin compromiso. Sin tarjeta.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-bold text-gray-700">Nombre completo</label>
          <input type="text" required value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium" placeholder="Tu nombre" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Correo electrónico</label>
          <input type="email" required value={formData.email} onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium" placeholder="tu@email.com" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Teléfono</label>
          <input type="tel" required value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium" placeholder="+34 600 000 000" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Tipo de clínica</label>
          <select required value={formData.clinicType} onChange={(e) => handleChange('clinicType', e.target.value)}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium bg-white">
            {CLINIC_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label} — {ct.desc}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Nombre de tu clínica</label>
          <input type="text" required value={formData.clinicName} onChange={(e) => handleChange('clinicName', e.target.value)}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium" placeholder="Ej. Clínica Fisioterapia Salud" />
        </div>
        {!isQuote && (
          <div>
            <label className="block text-sm font-bold text-gray-700">Contraseña</label>
            <input type="password" required minLength={6} value={formData.password} onChange={(e) => handleChange('password', e.target.value)}
              className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm font-medium" placeholder="Mínimo 6 caracteres" />
          </div>
        )}
        <button type="submit" disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-[#008477] hover:bg-[#007066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008477] disabled:opacity-70 transition-colors">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isQuote ? 'Enviar solicitud' : 'Empezar prueba gratis')}
        </button>
        <p className="text-center text-xs text-gray-400">
          Al registrarte aceptas nuestros{' '}
          <Link to="/terminos" className="text-[#008477] hover:underline">términos y condiciones</Link>.
        </p>
        <div className="text-center pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">¿Ya tienes cuenta? </span>
          <Link to="/login" className="text-sm font-bold text-[#008477] hover:text-[#007066]">Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}
