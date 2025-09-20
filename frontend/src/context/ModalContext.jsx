import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);

  const openRecruiterModal = () => {
    console.log('🔓 Opening recruiter modal');
    setIsRecruiterModalOpen(true);
  };

  const closeRecruiterModal = () => {
    console.log('🔒 Closing recruiter modal');
    console.log('🔒 Current isRecruiterModalOpen:', isRecruiterModalOpen);
    setIsRecruiterModalOpen(false);
    console.log('🔒 setIsRecruiterModalOpen(false) called');
  };

  return (
    <ModalContext.Provider
      value={{
        isRecruiterModalOpen,
        openRecruiterModal,
        closeRecruiterModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
