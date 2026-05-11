import { createContext, useContext, useState, ReactNode } from 'react';
import Modal from './Modal';
import DemoForm from './forms/DemoForm';
import ContractForm from './forms/ContractForm';
import ForgotPasswordForm from './forms/ForgotPasswordForm';

type ModalType = 'demo' | 'contract' | 'forgot-password' | null;

interface ModalContextValue {
  openModal: (type: ModalType, data?: Record<string, string>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modal, setModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<Record<string, string>>({});

  const openModal = (type: ModalType, data?: Record<string, string>) => {
    setModal(type);
    if (data) setModalData(data);
  };

  const closeModal = () => {
    setModal(null);
    setModalData({});
  };

  const renderModal = () => {
    switch (modal) {
      case 'demo':
        return <DemoForm onSuccess={closeModal} initialData={modalData} />;
      case 'contract':
        return <ContractForm initialData={modalData} />;
      case 'forgot-password':
        return <ForgotPasswordForm />;
      default:
        return null;
    }
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal isOpen={modal !== null} onClose={closeModal}>
        {renderModal()}
      </Modal>
    </ModalContext.Provider>
  );
}
