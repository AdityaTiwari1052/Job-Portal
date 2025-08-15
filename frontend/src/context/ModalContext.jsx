import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);

  const openRecruiterModal = () => setIsRecruiterModalOpen(true);
  const closeRecruiterModal = () => setIsRecruiterModalOpen(false);

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
