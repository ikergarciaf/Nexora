import { useState } from 'react';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useModal } from '../ModalContext';

export default function ForgotPasswordForm() {
  const { closeModal, openModal } = useModal();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al enviar el email');
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {sent ? (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Email enviado</h3>
          <p className="text-sm text-gray-500 mb-6">
            Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
          </p>
          <button onClick={closeModal} className="text-[#008477] font-medium hover:underline text-sm">
            Cerrar
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h2>
            <p className="mt-1 text-sm text-gray-500">Te enviaremos un enlace para restablecer tu contraseña.</p>
          </div>
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700">Email</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#008477] focus:border-[#008477] sm:text-sm"
                  placeholder="tu@email.com" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#008477] hover:bg-[#007066] focus:outline-none disabled:opacity-70 transition-colors">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar enlace'}
            </button>
            <div className="text-center">
              <button onClick={() => openModal('demo')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Volver a login
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
