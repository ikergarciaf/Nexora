import { FrontendNavbar } from '../components/FrontendNavbar';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Política de Privacidad</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-[15px] text-slate-600 leading-relaxed">
          <p><strong>Última actualización:</strong> 1 de mayo de 2026</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">1. Responsable del Tratamiento</h2>
          <p>Nexora (en adelante, "la Plataforma") actúa como responsable del tratamiento de los datos personales proporcionados por los usuarios. Puedes contactarnos en <a href="mailto:hola@nexora.co" className="text-[#008477] underline">hola@nexora.co</a>.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">2. Datos Recogidos</h2>
          <p>Recogemos la siguiente información:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nombre, email y teléfono del profesional</li>
            <li>Datos de la clínica (nombre, dirección, especialidad)</li>
            <li>Datos de pacientes introducidos por el usuario (nombre, contacto, historial clínico)</li>
            <li>Datos de pago procesados a través de Stripe (no almacenamos números de tarjeta)</li>
          </ul>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">3. Finalidad del Tratamiento</h2>
          <p>Los datos se tratan para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Prestar el servicio de gestión clínica contratado</li>
            <li>Gestión de citas, facturación e historial clínico</li>
            <li>Mejora del servicio mediante análisis agregados anonimizados</li>
            <li>Comunicaciones de servicio (recordatorios de citas, facturas)</li>
          </ul>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">4. Base Legal</h2>
          <p>El tratamiento se basa en la ejecución del contrato de servicios y, cuando corresponda, en el consentimiento del usuario.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">5. Destinatarios</h2>
          <p>No cedemos datos a terceros salvo obligación legal o para la prestación del servicio (Stripe para pagos, proveedor de hosting en la UE).</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">6. Conservación</h2>
          <p>Conservamos los datos mientras la cuenta esté activa. Tras la baja, se eliminan en un plazo máximo de 90 días.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">7. Derechos del Usuario</h2>
          <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición escribiendo a <a href="mailto:hola@nexora.co" className="text-[#008477] underline">hola@nexora.co</a> o desde la sección de configuración de tu cuenta.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8">8. Seguridad</h2>
          <p>Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado AES-256 en reposo, TLS en tránsito, y servidores en la Unión Europea.</p>
        </div>
      </div>
    </div>
  );
}
