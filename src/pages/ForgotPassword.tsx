import { FrontendNavbar } from '../components/FrontendNavbar';
import ForgotPasswordForm from '../components/forms/ForgotPasswordForm';
import { ModalProvider } from '../components/ModalContext';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gray-50">
      <FrontendNavbar />
      <div className="pt-24 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <ModalProvider>
            <ForgotPasswordForm />
          </ModalProvider>
        </div>
      </div>
    </div>
  );
}
