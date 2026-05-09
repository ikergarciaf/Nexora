import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'nexora_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl ring-1 ring-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-[13px] text-slate-600 flex-1 leading-relaxed">
          Usamos cookies esenciales para el funcionamiento de la plataforma y tokens de sesión para mantener tu cuenta segura. Al continuar navegando, aceptas el uso de estas cookies.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={reject}
            className="px-4 h-9 text-[13px] font-medium text-slate-600 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="px-4 h-9 text-[13px] font-medium text-white rounded-lg bg-slate-900 hover:bg-[#008477] transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
