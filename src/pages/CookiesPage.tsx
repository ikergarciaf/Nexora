import { FrontendNavbar } from '../components/FrontendNavbar';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Política de Cookies</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-[15px] text-slate-600 leading-relaxed">
          <p><strong>Última actualización:</strong> 1 de mayo de 2026</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">1. ¿Qué son las cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas un sitio web. Se utilizan para recordar preferencias, mejorar la experiencia de navegación y obtener estadísticas de uso.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">2. Cookies que utilizamos</h2>
          <table className="w-full text-left text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-4 font-semibold text-slate-900">Tipo</th>
                <th className="py-2 pr-4 font-semibold text-slate-900">Finalidad</th>
                <th className="py-2 font-semibold text-slate-900">Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">Token de sesión (JWT)</td>
                <td className="py-2 pr-4">Mantener la sesión iniciada</td>
                <td className="py-2">Persistente (localStorage)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">Preferencias de UI</td>
                <td className="py-2 pr-4">Recordar tema oscuro/claro</td>
                <td className="py-2">Persistente (localStorage)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">Cookie de consentimiento</td>
                <td className="py-2 pr-4">Recordar tu aceptación de cookies</td>
                <td className="py-2">1 año</td>
              </tr>
            </tbody>
          </table>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">3. Cookies de Terceros</h2>
          <p>Utilizamos Stripe como pasarela de pago, que puede establecer cookies propias durante el proceso de pago. No utilizamos cookies de tracking, publicitarias ni de redes sociales.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">4. Gestión de Cookies</h2>
          <p>Puedes gestionar las cookies desde la configuración de tu navegador. También puedes rechazar las cookies no esenciales mediante el banner de consentimiento que aparece al acceder a la plataforma.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">5. Contacto</h2>
          <p>Si tienes dudas sobre nuestra política de cookies, escríbenos a <a href="mailto:hola@nexora.co" className="text-[#008477] underline">hola@nexora.co</a>.</p>
        </div>
      </div>
    </div>
  );
}
