"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ModalContextType {
  openMenus: Set<string>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  const openModal = useCallback((id: string) => {
    setOpenMenus((prev) => new Set(prev).add(id));
  }, []);

  const closeModal = useCallback((id: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setOpenMenus(new Set());
  }, []);

  return (
    <ModalContext.Provider
      value={{ openMenus, openModal, closeModal, closeAllModals }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within ModalProvider");
  }
  return context;
}
