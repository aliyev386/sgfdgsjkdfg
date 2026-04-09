import './App.css'
import { Outlet } from 'react-router-dom'
import AuthEventListener from './components/common/AuthEventListener'
import AuthModal from './components/common/AuthModal'
import { AuthModalProvider, useAuthModal } from './hooks/useAuthModal'

function AppInner() {
  const { isOpen, tab, onSuccess, closeAuthModal } = useAuthModal();
  return (
    <>
      <AuthEventListener />
      <Outlet />
      <AuthModal
        isOpen={isOpen}
        defaultTab={tab}
        onClose={closeAuthModal}
        onSuccess={onSuccess}
      />
    </>
  );
}

function App() {
  return (
    <AuthModalProvider>
      <AppInner />
    </AuthModalProvider>
  );
}

export default App