import './App.css'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthEventListener from './components/common/AuthEventListener'
import AuthModal from './components/common/AuthModal'
import { AuthModalProvider, useAuthModal } from './hooks/useAuthModal'
import CartAddedPopup from './components/common/CartAddedPopup'

function AppInner() {
  const { isOpen, tab, onSuccess, closeAuthModal } = useAuthModal();
  const navigate = useNavigate();

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem('amore_user') || '{}');
      if (stored?.role === 'Admin') {
        navigate('/admin', { replace: true });
      }
    } catch {}
  };

  return (
    <>
      <AuthEventListener />
      <Outlet />
      <AuthModal
        isOpen={isOpen}
        defaultTab={tab}
        onClose={closeAuthModal}
        onSuccess={handleSuccess}
      />
      {/* Global cart popup — bütün səhifələrdə görünür */}
      <CartAddedPopup />
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
