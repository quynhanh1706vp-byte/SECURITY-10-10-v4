'use client';

import React, { createContext, useContext } from 'react';
import { Modal } from 'antd';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';

// Create context type that includes modal functions
type ModalContextType = Omit<ModalStaticFunctions, 'warn'> & {
  contextHolder: React.ReactElement;
};

// Create the context
const ModalContext = createContext<ModalContextType | null>(null);

// Create provider component
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modal, contextHolder] = Modal.useModal();

  return (
    <ModalContext.Provider value={{ ...modal, contextHolder }}>
      {children}
      {contextHolder}
    </ModalContext.Provider>
  );
};

// Create hook for using the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
