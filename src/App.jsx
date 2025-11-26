import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CurrentUserProvider } from './contexts/CurrentUserContext';
import { ToastProvider } from './contexts/ToastContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Dashboard from './components/Dashboard';
import Inversiones from './components/Main/Inversiones';
import Transacciones from './components/Main/Transacciones';
import Gastos from './components/Main/Gastos';
import Ingresos from './components/Main/Ingresos';
import Ahorros from './components/Main/Ahorros';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import UserSettings from './components/UserSettings/UserSettings';
import './App.css';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleEsc);

  return () => {
    window.removeEventListener('keydown', handleEsc);
  };
}, [navigate]);

 return (
    <Routes>
      {/* Rutas públicas (sin Header/Footer) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas protegidas (con Header/Footer) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Header />
          <Dashboard />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/inversiones" element={
        <ProtectedRoute>
          <Header />
          <Inversiones />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/transacciones" element={
        <ProtectedRoute>
          <Header />
          <Transacciones />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/gastos" element={
        <ProtectedRoute>
          <Header />
          <Gastos />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/ingresos" element={
        <ProtectedRoute>
          <Header />
          <Ingresos />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/ahorros" element={
        <ProtectedRoute>
          <Header />
          <Ahorros />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Header />
          <UserSettings />
          <Footer />
        </ProtectedRoute>
      } />
    </Routes>
  ); 
}

function App () {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <CurrentUserProvider>
          <TransactionsProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </TransactionsProvider>
        </CurrentUserProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}


export default App;