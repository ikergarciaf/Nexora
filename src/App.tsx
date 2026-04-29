import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SpecialtyLanding from './pages/SpecialtyLanding';
import LoginPage from './pages/LoginPage';
import TenantSelector from './pages/TenantSelector';
import WhatsAppDemo from './pages/WhatsAppDemo';

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-id';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tenants" element={<TenantSelector />} />
          <Route path="/soluciones/:specialty" element={<SpecialtyLanding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/whatsapp-demo" element={<WhatsAppDemo />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
