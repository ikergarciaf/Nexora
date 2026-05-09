import { FrontendNavbar } from '../components/FrontendNavbar';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Términos y Condiciones</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-[15px] text-slate-600 leading-relaxed">
          <p><strong>Última actualización:</strong> 1 de mayo de 2026</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">1. Aceptación</h2>
          <p>Al utilizar la plataforma Nexora, aceptas los presentes términos y condiciones. Si no estás de acuerdo, no debes usar el servicio.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">2. Descripción del Servicio</h2>
          <p>Nexora proporciona un software de gestión clínica en la nube que incluye agenda, historial clínico, facturación, comunicación con pacientes y funcionalidades de inteligencia artificial.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">3. Cuentas y Responsabilidad</h2>
          <p>Eres responsable de mantener la confidencialidad de tus credenciales de acceso. La información clínica de tus pacientes es tu responsabilidad como profesional sanitario.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">4. Uso de IA</h2>
          <p>Las funciones de inteligencia artificial (resúmenes clínicos, borradores de WhatsApp) son herramientas de asistencia. El profesional sanitario debe revisar y validar cualquier output generado por IA antes de su uso clínico.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">5. Facturación</h2>
          <p>Los precios se indican en la página de precios. Los pagos se procesan a través de Stripe. Las suscripciones se renuevan automáticamente salvo cancelación.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">6. Cancelación</h2>
          <p>Puedes cancelar tu suscripción en cualquier momento. Tras la cancelación, conservarás acceso hasta el final del período facturado.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">7. Limitación de Responsabilidad</h2>
          <p>Nexora se proporciona "tal cual". No nos hacemos responsables de daños indirectos derivados del uso del servicio, incluyendo pérdida de datos o interrupción del servicio.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">8. Legislación</h2>
          <p>Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados de Madrid.</p>
        </div>
      </div>
    </div>
  );
}
