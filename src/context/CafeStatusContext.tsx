import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToCafeStatus, updateCafeStatus, getInitialCafeStatus } from '../firebase';
import { isCafeOpen } from '../utils/cafeHelpers';

interface CafeStatusContextType {
  isOpen: boolean;
  statusInfo: { isOpen: boolean; message: string; badgeColor: string };
  toggleCafeStatus: (newVal?: boolean) => Promise<void>;
  isLoading: boolean;
}

const CafeStatusContext = createContext<CafeStatusContextType | undefined>(undefined);

export const CafeStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => getInitialCafeStatus());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToCafeStatus((status) => {
      setIsOpen(status);
    });
    return () => unsubscribe();
  }, []);

  const toggleCafeStatus = async (newVal?: boolean) => {
    const nextState = typeof newVal === 'boolean' ? newVal : !isOpen;
    setIsOpen(nextState);
    setIsLoading(true);
    try {
      await updateCafeStatus(nextState);
    } catch (err) {
      console.error('Failed to update cafe status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusInfo = isCafeOpen(isOpen);

  return (
    <CafeStatusContext.Provider value={{ isOpen, statusInfo, toggleCafeStatus, isLoading }}>
      {children}
    </CafeStatusContext.Provider>
  );
};

export function useCafeStatus() {
  const context = useContext(CafeStatusContext);
  if (!context) {
    const fallback = isCafeOpen();
    return {
      isOpen: fallback.isOpen,
      statusInfo: fallback,
      toggleCafeStatus: async () => {},
      isLoading: false,
    };
  }
  return context;
}
