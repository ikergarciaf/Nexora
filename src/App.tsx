import { lazy, Suspense, Component, ReactNode, ErrorInfo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import CookieConsent from './components/CookieConsent';
import { ModalProvider } from './components/ModalContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SpecialtyLanding = lazy(() => import('./pages/SpecialtyLanding'));
const TenantSelector = lazy(() => import('./pages/TenantSelector'));
const WhatsAppDemo = lazy(() => import('./pages/WhatsAppDemo'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ClinicWebsite = lazy(() => import('./pages/ClinicWebsite'));
const PublicBooking = lazy(() => import('./pages/PublicBooking'));
const PatientPortal = lazy(() => import('./pages/PatientPortal'));
const DemoRegisterPage = lazy(() => import('./pages/DemoRegisterPage'));
const ContractPage = lazy(() => import('./pages/ContractPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#008477]" />
        <span className="text-sm text-slate-500">Cargando...</span>
      </div>
    </div>
  );
}

function AuthGuard() {
  const token = localStorage.getItem('clinic_token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestGuard() {
  const token = localStorage.getItem('clinic_token');
  if (token) return <Navigate to="/tenants" replace />;
  return <Outlet />;
}

function AuthListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [navigate]);
  return null;
}

interface ErrorBoundaryState { hasError: boolean }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Algo salió mal</h1>
            <p className="text-slate-500 mb-6">Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-[#008477] transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

export default function App() {
  const routerContent = (
    <BrowserRouter>
      <AuthListener />
      <ModalProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/soluciones/:specialty" element={<SpecialtyLanding />} />
            <Route path="/whatsapp-demo" element={<WhatsAppDemo />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/clinica/:slug" element={<ClinicWebsite />} />
            <Route path="/book/:slug" element={<PublicBooking />} />
            <Route path="/portal/:slug/:patientId" element={<PatientPortal />} />
            <Route path="/demo" element={<DemoRegisterPage />} />
            <Route path="/contratar/:specialty" element={<ContractPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />

            <Route element={<GuestGuard />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route element={<AuthGuard />}>
              <Route path="/tenants" element={<TenantSelector />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/billing" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
                  <p className="text-slate-500 mb-6">Página no encontrada</p>
                  <a href="/" className="text-[#008477] font-medium hover:underline">Volver al inicio</a>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
        <CookieConsent />
      </ModalProvider>
    </BrowserRouter>
  );

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const content = googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {routerContent}
    </GoogleOAuthProvider>
  ) : routerContent;

  return (
    <ErrorBoundary>
      {content}
    </ErrorBoundary>
  );
}
