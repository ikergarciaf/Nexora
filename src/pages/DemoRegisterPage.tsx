import { useSearchParams } from 'react-router-dom';
import DemoForm from '../components/forms/DemoForm';
import { FrontendNavbar } from '../components/FrontendNavbar';

export default function DemoRegisterPage() {
  const [searchParams] = useSearchParams();
  const initialData: Record<string, string> = {};
  const type = searchParams.get('type');
  const specialty = searchParams.get('specialty');
  const plan = searchParams.get('plan');
  const interval = searchParams.get('interval');
  if (type) initialData.type = type;
  if (specialty) initialData.specialty = specialty;
  if (plan) initialData.plan = plan;
  if (interval) initialData.interval = interval;

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
