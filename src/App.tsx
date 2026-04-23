import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PatientPortal from './pages/PatientPortal';
import PublicBooking from './pages/PublicBooking';
import SpecialtyLanding from './pages/SpecialtyLanding';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/soluciones/:specialty" element={<SpecialtyLanding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portal/:token" element={<PatientPortal />} />
        <Route path="/book/:tenantId" element={<PublicBooking />} />
      </Routes>
    </BrowserRouter>
  );
}
