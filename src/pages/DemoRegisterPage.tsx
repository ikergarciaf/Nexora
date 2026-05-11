import { useSearchParams } from 'react-router-dom';
import DemoForm from '../components/forms/DemoForm';
import { FrontendNavbar } from '../components/FrontendNavbar';

export default function DemoRegisterPage() {
  const [searchParams] = useSearchParams();
  const initialData: Record<string, string> = {};
  const type = searchParams.get('type');
  const specialty = searchParams.get('specialty');
  if (type) initialData.type = type;
  if (specialty) initialData.specialty = specialty;

  return (
    <div className="min-h-screen bg-gray-50">
      <FrontendNavbar />
      <div className="pt-24 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <DemoForm onSuccess={() => {}} initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
