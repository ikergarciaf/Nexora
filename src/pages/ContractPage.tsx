import { useParams, Link } from 'react-router-dom';
import { FrontendNavbar } from '../components/FrontendNavbar';
import ContractForm from '../components/forms/ContractForm';

export default function ContractPage() {
  const { specialty } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <FrontendNavbar />
      <div className="pt-24 flex items-start justify-center px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <ContractForm initialData={{ specialty: specialty || 'dental' }} />
        </div>
      </div>
    </div>
  );
}
