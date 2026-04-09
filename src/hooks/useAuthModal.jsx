import { createContext, useContext, useState, useCallback, createElement } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, tab: "login", onSuccess: null });

  const openAuthModal = useCallback((tab = "login", onSuccess = null) => {
    setState({ isOpen: true, tab, onSuccess });
  }, []);

  const closeAuthModal = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return createElement(
    AuthModalContext.Provider,
    { value: { ...state, openAuthModal, closeAuthModal } },
    children
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}